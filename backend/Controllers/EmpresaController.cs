using Avaliação_de_Segurança.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Avaliação_de_Segurança.DTOs;

namespace Avaliação_de_Segurança.Controllers
{
    [ApiController]
    [Route("api/empresa")]
    public class EmpresaController : ControllerBase
    {
        private readonly IEmpresaService _empresaService;
        public EmpresaController(IEmpresaService empresaService)
        {
            _empresaService = empresaService;
        }

        [HttpGet("Listar")]
        public IActionResult Listar()
        {
            try
            {
                List<EmpresaResponse> empresas = _empresaService.Listar();
                return Ok(empresas);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("Cadastrar")]
        public IActionResult Cadastrar([FromBody] CriarEmpresaRequest request)
        {
            try
            {
                _empresaService.Cadastrar(request);
                return Created();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}