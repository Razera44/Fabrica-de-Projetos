using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.Entities
{
    public class Resposta
    {
        public int Id { get; set; }
        public int PerguntaId { get; set; }
        public string Texto { get; set; }
        public OpcaoResposta Opcao { get; set; }
        public int Peso { get; set; }
        public Pergunta? Pergunta { get; set; }
    }
}