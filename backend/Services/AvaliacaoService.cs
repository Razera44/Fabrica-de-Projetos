using Avaliação_de_Segurança.DTOs;
using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Enums;
using Avaliação_de_Segurança.Interfaces;

namespace Avaliação_de_Segurança.Services
{
    public class AvaliacaoService : IAvaliacaoService
    {
        private readonly IAvaliacaoRepository _repository;
        private readonly IEmpresaRepository _empresaRepository;
        private readonly IPerguntaRepository _perguntaRepository;
        public AvaliacaoService(IAvaliacaoRepository repository, IEmpresaRepository empresaRepository, IPerguntaRepository perguntaRepository)
        {
            _repository = repository;
            _empresaRepository = empresaRepository;
            _perguntaRepository = perguntaRepository;
        }

        public AvaliacaoIniciadaResponse Iniciar(IniciarAvaliacaoRequest request)
        {
            if (request.EmpresaId == 0)
            {
                throw new Exception("Id da empresa inválido.");
            }

            if (string.IsNullOrWhiteSpace(request.NomeResponsavel))
            {
                throw new Exception("O nome do responsável é obrigatório.");
            }

            Empresa empresa = _empresaRepository.BuscarPorId(request.EmpresaId);

            if (empresa == null)
            {
                throw new Exception("Não existe nenhuma empresa com este Id.");
            }

            var avaliacao = new Avaliacao
            {
                Id = 0,
                EmpresaId = empresa.Id,
                NomeResponsavel = request.NomeResponsavel.Trim(),
                DataInicio = DateTime.Now,
                Finalizada = false
            };

            _repository.Salvar(avaliacao);

            List<Pergunta> perguntas = _perguntaRepository.Listar();

            var response = new AvaliacaoIniciadaResponse
            {
                AvaliacaoId = avaliacao.Id,
                EmpresaId = empresa.Id,
                NomeEmpresa = empresa.Nome,
                NomeResponsavel = avaliacao.NomeResponsavel,
                Perguntas = new List<PerguntaResponse>()
            };

            foreach (var pergunta in perguntas)
            {
                var perguntaResponse = new PerguntaResponse
                {
                    Id = pergunta.Id,
                    Texto = pergunta.Texto,
                    Categoria = pergunta.Categoria,
                    Respostas = new List<RespostaResponse>()
                };

                foreach (var resposta in pergunta.Respostas.OrderBy(r => r.Opcao))
                {
                    perguntaResponse.Respostas.Add(new RespostaResponse
                    {
                        Id = resposta.Id,
                        Texto = resposta.Texto,
                        Opcao = resposta.Opcao
                    });
                }

                response.Perguntas.Add(perguntaResponse);
            }

            return response;
        }

        public void Responder(ResponderPerguntaRequest request)
        {
            Avaliacao avaliacao = BuscarAvaliacao(request.AvaliacaoId);

            if (avaliacao.Finalizada)
            {
                throw new Exception("Esta avaliação já foi finalizada.");
            }

            if (request.PerguntaId == 0)
            {
                throw new Exception("Id da pergunta inválido.");
            }

            if (request.RespostaId == 0)
            {
                throw new Exception("Id da resposta inválido.");
            }

            Pergunta pergunta = _perguntaRepository.BuscarPorId(request.PerguntaId);

            if (pergunta == null)
            {
                throw new Exception("Não existe nenhuma pergunta com este Id.");
            }

            Resposta resposta = pergunta.Respostas.FirstOrDefault(r => r.Id == request.RespostaId);

            if (resposta == null)
            {
                throw new Exception("A resposta informada não pertence a esta pergunta.");
            }

            RespostaAvaliacao respostaExistente = avaliacao.RespostasAvaliacao.FirstOrDefault(r => r.PerguntaId == pergunta.Id);

            if (respostaExistente != null)
            {
                respostaExistente.RespostaId = resposta.Id;
                respostaExistente.Resposta = resposta;
            }
            else
            {
                avaliacao.RespostasAvaliacao.Add(new RespostaAvaliacao
                {
                    Id = 0,
                    AvaliacaoId = avaliacao.Id,
                    PerguntaId = pergunta.Id,
                    RespostaId = resposta.Id
                });
            }

            _repository.Atualizar(avaliacao);
        }

        public ResultadoAvaliacaoResponse Finalizar(int id)
        {
            Avaliacao avaliacao = BuscarAvaliacao(id);

            if (avaliacao.Finalizada)
            {
                throw new Exception("Esta avaliação já foi finalizada.");
            }

            List<Pergunta> perguntas = _perguntaRepository.Listar();

            if (avaliacao.RespostasAvaliacao.Count < perguntas.Count)
            {
                throw new Exception("Responda todas as perguntas antes de finalizar a avaliação.");
            }

            avaliacao.NotaBackup = CalcularNotaCategoria(avaliacao, CategoriaPergunta.Backup);
            avaliacao.NotaAntivirus = CalcularNotaCategoria(avaliacao, CategoriaPergunta.Antivirus);
            avaliacao.NotaSenha = CalcularNotaCategoria(avaliacao, CategoriaPergunta.Senha);
            avaliacao.NotaLgpd = CalcularNotaCategoria(avaliacao, CategoriaPergunta.Lgpd);

            avaliacao.NotaGeral = Math.Round(
                avaliacao.NotaBackup.Value * 0.30m + avaliacao.NotaSenha.Value * 0.25m +
                avaliacao.NotaAntivirus.Value * 0.20m + avaliacao.NotaLgpd.Value * 0.25m, 0);
            avaliacao.Classificacao = ClassificarNotaGeral(avaliacao.NotaGeral.Value);
            avaliacao.DataFinalizacao = DateTime.Now;
            avaliacao.Finalizada = true;

            _repository.Atualizar(avaliacao);

            return MontarResultado(avaliacao);
        }

        public ResultadoAvaliacaoResponse ObterResultado(int id)
        {
            Avaliacao avaliacao = BuscarAvaliacao(id);

            if (!avaliacao.Finalizada)
            {
                throw new Exception("Esta avaliação ainda não foi finalizada.");
            }

            return MontarResultado(avaliacao);
        }

        private Avaliacao BuscarAvaliacao(int id)
        {
            if (id == 0)
            {
                throw new Exception("Id inválido.");
            }

            Avaliacao avaliacao = _repository.BuscarPorId(id);

            if (avaliacao == null)
            {
                throw new Exception("Não existe nenhuma avaliação com este Id.");
            }

            return avaliacao;
        }

        private decimal CalcularNotaCategoria(Avaliacao avaliacao, CategoriaPergunta categoria)
        {
            var respostasDaCategoria = avaliacao.RespostasAvaliacao
                .Where(r => r.Pergunta.Categoria == categoria)
                .ToList();

            if (respostasDaCategoria.Count == 0)
            {
                throw new Exception("Não há respostas para a categoria " + categoria + ".");
            }

            decimal media = (decimal)respostasDaCategoria.Average(r => r.Resposta.Peso);

            return Math.Round(media, 2);
        }

        private ClassificacaoGeral ClassificarNotaGeral(decimal notaGeral)
        {
            if (notaGeral >= 75)
            {
                return ClassificacaoGeral.Bom;
            }

            if (notaGeral >= 50)
            {
                return ClassificacaoGeral.Mediano;
            }

            return ClassificacaoGeral.Critico;
        }

        private ResultadoAvaliacaoResponse MontarResultado(Avaliacao avaliacao)
        {
            return new ResultadoAvaliacaoResponse
            {
                AvaliacaoId = avaliacao.Id,
                NomeEmpresa = avaliacao.Empresa.Nome,
                NomeResponsavel = avaliacao.NomeResponsavel,
                DataInicio = avaliacao.DataInicio,
                DataFinalizacao = avaliacao.DataFinalizacao,
                NotaBackup = avaliacao.NotaBackup.Value,
                NotaAntivirus = avaliacao.NotaAntivirus.Value,
                NotaSenha = avaliacao.NotaSenha.Value,
                NotaLgpd = avaliacao.NotaLgpd.Value,
                NotaGeral = avaliacao.NotaGeral.Value,
                Classificacao = avaliacao.Classificacao.Value
            };
        }
    }
}
