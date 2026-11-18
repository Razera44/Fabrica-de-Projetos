using Avaliação_de_Segurança.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Avaliação_de_Segurança.DTOs;

namespace Avaliação_de_Segurança.Controllers
{
    [ApiController]
    [Route("api/avaliacao")]
    public class AvaliacaoController : ControllerBase
    {
        private readonly IAvaliacaoService _avaliacaoService;
        public AvaliacaoController(IAvaliacaoService avaliacaoService)
        {
            _avaliacaoService = avaliacaoService;
        }

        [HttpPost("Iniciar")]
        public IActionResult Iniciar([FromBody] IniciarAvaliacaoRequest request)
        {
            try
            {
                AvaliacaoIniciadaResponse avaliacao = _avaliacaoService.Iniciar(request);
                return Ok(avaliacao);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("Responder")]
        public IActionResult Responder([FromBody] ResponderPerguntaRequest request)
        {
            try
            {
                _avaliacaoService.Responder(request);
                return Ok("Resposta registrada com sucesso.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("Finalizar")]
        public IActionResult Finalizar(int id)
        {
            try
            {
                ResultadoAvaliacaoResponse resultado = _avaliacaoService.Finalizar(id);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("Resultado/{id:int}")]
        public IActionResult ObterResultado(int id)
        {
            try
            {
                ResultadoAvaliacaoResponse resultado = _avaliacaoService.ObterResultado(id);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}