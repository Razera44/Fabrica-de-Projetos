using Avaliação_de_Segurança.DTOs;

namespace Avaliação_de_Segurança.Interfaces
{
    public interface IAvaliacaoService
    {
        public AvaliacaoIniciadaResponse Iniciar(IniciarAvaliacaoRequest request);
        public void Responder(ResponderPerguntaRequest request);
        public ResultadoAvaliacaoResponse Finalizar(int id);
        public ResultadoAvaliacaoResponse ObterResultado(int id);
    }
}