using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.Data
{
    public static class SeedBanco
    {
        private static readonly OpcaoResposta[] _opcoes = { OpcaoResposta.Bom, OpcaoResposta.Media, OpcaoResposta.Ruim };
        private static readonly int[] _pesos = { 100, 50, 0 };

        // Cada pergunta traz as 3 respostas na ordem: Bom, Média, Ruim
        private static readonly List<(CategoriaPergunta Categoria, string Texto, string[] Respostas)> _modelo = new()
        {
            // BACKUP
            (CategoriaPergunta.Backup, "Sua empresa faz backup dos arquivos importantes?",
                new[] { "Sim, automático e regular", "Sim, mas manual e irregular", "Não faço backup" }),
            (CategoriaPergunta.Backup, "Onde fica armazenada a cópia de backup?",
                new[] { "Em nuvem ou local externo, fora do computador principal", "No mesmo computador ou HD interno", "Não sei / não tenho backup" }),
            (CategoriaPergunta.Backup, "Com que frequência o backup é atualizado?",
                new[] { "Diariamente", "Semanalmente ou mensalmente", "Raramente ou nunca" }),
            (CategoriaPergunta.Backup, "Você já testou restaurar um backup para ver se ele funciona?",
                new[] { "Sim, já testei", "Não, nunca testei", "Não tenho backup pra testar" }),
            (CategoriaPergunta.Backup, "Se o computador principal quebrasse hoje, quanto tempo levaria pra empresa voltar a funcionar?",
                new[] { "Menos de 1 dia", "Alguns dias", "Não sei / levaria semanas" }),

            // SENHA
            (CategoriaPergunta.Senha, "As senhas dos sistemas da empresa são únicas entre si?",
                new[] { "Sim, cada sistema tem uma senha diferente", "Algumas são repetidas", "Uso a mesma senha em quase tudo" }),
            (CategoriaPergunta.Senha, "Os funcionários usam autenticação em duas etapas (2FA) nos acessos importantes?",
                new[] { "Sim, na maioria dos acessos", "Em alguns", "Não uso" }),
            (CategoriaPergunta.Senha, "Como as senhas são compartilhadas entre a equipe, quando necessário?",
                new[] { "Por um gerenciador de senhas seguro", "Por WhatsApp, papel ou planilha", "Não compartilhamos" }),
            (CategoriaPergunta.Senha, "Ex-funcionários ainda têm acesso a algum sistema da empresa?",
                new[] { "Não, os acessos são removidos ao sair", "Não sei dizer", "Sim, provavelmente" }),
            (CategoriaPergunta.Senha, "Com que frequência as senhas são trocadas ou revisadas?",
                new[] { "Periodicamente, seguindo uma rotina", "Só quando esqueço ou dá problema", "Nunca trocamos" }),

            // ANTIVÍRUS
            (CategoriaPergunta.Antivirus, "Os computadores da empresa têm antivírus instalado?",
                new[] { "Sim, em todos e atualizado", "Em alguns", "Não tenho antivírus" }),
            (CategoriaPergunta.Antivirus, "As atualizações do sistema operacional são feitas automaticamente?",
                new[] { "Sim, automáticas", "Às vezes, manualmente", "Não atualizo" }),
            (CategoriaPergunta.Antivirus, "Os dispositivos da empresa (celulares, notebooks) têm senha ou biometria de bloqueio?",
                new[] { "Sim, todos", "Alguns", "Nenhum" }),
            (CategoriaPergunta.Antivirus, "A empresa usa uma rede Wi-Fi separada para visitantes e para o negócio?",
                new[] { "Sim, redes separadas", "Não, é a mesma rede pra tudo", "Não sei" }),
            (CategoriaPergunta.Antivirus, "Já aconteceu algum caso de vírus, travamento suspeito ou sequestro de arquivos (ransomware)?",
                new[] { "Nunca", "Já aconteceu, mas resolvemos", "Já aconteceu e perdemos dados" }),

            // LGPD
            (CategoriaPergunta.Lgpd, "A empresa sabe quais dados pessoais de clientes ela armazena?",
                new[] { "Sim, temos isso mapeado", "Mais ou menos, não é formalizado", "Não sei dizer" }),
            (CategoriaPergunta.Lgpd, "Existe uma política de privacidade visível para os clientes?",
                new[] { "Sim, publicada e atualizada", "Existe, mas está desatualizada", "Não existe" }),
            (CategoriaPergunta.Lgpd, "Os dados dos clientes são compartilhados com terceiros (fornecedores, parceiros)?",
                new[] { "Não compartilhamos", "Compartilhamos com consentimento formal", "Compartilhamos sem controle definido" }),
            (CategoriaPergunta.Lgpd, "Se um cliente pedir para apagar seus dados, a empresa sabe como fazer isso?",
                new[] { "Sim, temos um processo definido", "Saberíamos resolver na hora", "Não saberíamos o que fazer" }),
            (CategoriaPergunta.Lgpd, "Algum funcionário já recebeu orientação sobre como tratar dados pessoais de clientes?",
                new[] { "Sim, todos foram orientados", "Só alguns", "Ninguém recebeu orientação" })
        };

        public static List<Pergunta> ObterPerguntas()
        {
            var perguntas = new List<Pergunta>();

            for (int i = 0; i < _modelo.Count; i++)
            {
                perguntas.Add(new Pergunta
                {
                    Id = i + 1,
                    Texto = _modelo[i].Texto,
                    Categoria = _modelo[i].Categoria
                });
            }

            return perguntas;
        }

        public static List<Resposta> ObterRespostas()
        {
            var respostas = new List<Resposta>();

            for (int i = 0; i < _modelo.Count; i++)
            {
                for (int j = 0; j < _opcoes.Length; j++)
                {
                    respostas.Add(new Resposta
                    {
                        Id = (i * 3) + j + 1,
                        PerguntaId = i + 1,
                        Texto = _modelo[i].Respostas[j],
                        Opcao = _opcoes[j],
                        Peso = _pesos[j]
                    });
                }
            }

            return respostas;
        }
    }
}