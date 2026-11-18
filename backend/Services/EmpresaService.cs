using Avaliação_de_Segurança.DTOs;
using Avaliação_de_Segurança.Entities;
using Avaliação_de_Segurança.Interfaces;

namespace Avaliação_de_Segurança.Services
{
    public class EmpresaService : IEmpresaService
    {
        private readonly IEmpresaRepository _repository;
        public EmpresaService(IEmpresaRepository repository)
        {
            _repository = repository;
        }

        public void Cadastrar(CriarEmpresaRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nome))
            {
                throw new Exception("O nome da empresa é obrigatório.");
            }

            string nome = request.Nome.Trim();

            Empresa empresaPorNome = _repository.BuscarPorNome(nome);

            if (empresaPorNome != null)
            {
                throw new Exception("Já existe uma empresa com este nome.");
            }

            var empresa = new Empresa
            {
                Id = 0,
                Nome = nome
            };

            _repository.Salvar(empresa);
        }

        public List<EmpresaResponse> Listar()
        {
            List<Empresa> empresas = _repository.Listar();

            var response = new List<EmpresaResponse>();

            foreach (var empresa in empresas)
            {
                response.Add(new EmpresaResponse
                {
                    Id = empresa.Id,
                    Nome = empresa.Nome
                });
            }

            return response;
        }
    }
}