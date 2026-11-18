using Avaliação_de_Segurança.Entities;

namespace Avaliação_de_Segurança.Interfaces
{
    public interface IAvaliacaoRepository
    {
        public Avaliacao BuscarPorId(int id);
        public void Salvar(Avaliacao avaliacao);
        public void Atualizar(Avaliacao avaliacao);
    }
}