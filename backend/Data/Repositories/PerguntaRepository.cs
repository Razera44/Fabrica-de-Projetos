using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Avaliação_de_Segurança.Data.Repositories
{
    public class PerguntaRepository : IPerguntaRepository
    {
        private readonly ContextoBanco _bd;
        public PerguntaRepository(ContextoBanco bd)
        {
            _bd = bd;
        }

        public Pergunta BuscarPorId(int id)
        {
            try
            {
                Pergunta? pergunta = _bd.Pergunta
                    .Include(p => p.Respostas)
                    .Where(p => p.Id == id)
                    .FirstOrDefault();
                return pergunta;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public List<Pergunta> Listar()
        {
            try
            {
                List<Pergunta> perguntas = _bd.Pergunta
                    .Include(p => p.Respostas)
                    .OrderBy(p => p.Id)
                    .ToList();
                return perguntas;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}