using Avaliação_de_Segurança.Entities;

namespace Avaliação_de_Segurança.Interfaces
{
    public interface IPerguntaRepository
    {
        public Pergunta BuscarPorId(int id);
        public List<Pergunta> Listar();
    }
}