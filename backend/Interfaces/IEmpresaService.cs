using Avaliação_de_Segurança.DTOs;

namespace Avaliação_de_Segurança.Interfaces
{
    public interface IEmpresaService
    {
        public void Cadastrar(CriarEmpresaRequest request);
        public List<EmpresaResponse> Listar();
    }
}