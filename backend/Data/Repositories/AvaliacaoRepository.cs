using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Avaliação_de_Segurança.Data.Repositories
{
    public class AvaliacaoRepository : IAvaliacaoRepository
    {
        private readonly ContextoBanco _bd;
        public AvaliacaoRepository(ContextoBanco bd)
        {
            _bd = bd;
        }

        public Avaliacao BuscarPorId(int id)
        {
            try
            {
                Avaliacao? avaliacao = _bd.Avaliacao
                    .Include(a => a.Empresa)
                    .Include(a => a.RespostasAvaliacao).ThenInclude(r => r.Pergunta)
                    .Include(a => a.RespostasAvaliacao).ThenInclude(r => r.Resposta)
                    .Where(a => a.Id == id)
                    .FirstOrDefault();
                return avaliacao;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public void Salvar(Avaliacao avaliacao)
        {
            _bd.Avaliacao.Add(avaliacao);
            _bd.SaveChanges();
        }

        public void Atualizar(Avaliacao avaliacao)
        {
            _bd.Entry(avaliacao).State = EntityState.Modified;
            _bd.SaveChanges();
        }
    }
}