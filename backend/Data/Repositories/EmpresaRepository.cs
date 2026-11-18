using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Interfaces;

namespace Avaliação_de_Segurança.Data.Repositories
{
    public class EmpresaRepository : IEmpresaRepository
    {
        private readonly ContextoBanco _bd;
        public EmpresaRepository(ContextoBanco bd)
        {
            _bd = bd;
        }

        public Empresa BuscarPorId(int id)
        {
            try
            {
                Empresa? empresa = _bd.Empresa.Where(e => e.Id == id).FirstOrDefault();
                return empresa;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public Empresa BuscarPorNome(string nome)
        {
            try
            {
                Empresa? empresa = _bd.Empresa.Where(e => e.Nome == nome).FirstOrDefault();
                return empresa;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public List<Empresa> Listar()
        {
            try
            {
                List<Empresa> empresas = _bd.Empresa.OrderBy(e => e.Nome).ToList();
                return empresas;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public void Salvar(Empresa empresa)
        {
            _bd.Empresa.Add(empresa);
            _bd.SaveChanges();
        }
    }
}