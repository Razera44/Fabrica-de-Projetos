using Avaliação_de_Segurança.Entities;

namespace Avaliação_de_Segurança.Interfaces
{
    public interface IEmpresaRepository
    {
        public Empresa BuscarPorId(int id);
        public Empresa BuscarPorNome(string nome);
        public List<Empresa> Listar();
        public void Salvar(Empresa empresa);
    }
}