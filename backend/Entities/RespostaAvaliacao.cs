namespace Avaliação_de_Segurança.Entities
{
    public class RespostaAvaliacao
    {
        public int Id { get; set; }
        public int AvaliacaoId { get; set; }
        public int PerguntaId { get; set; }
        public int RespostaId { get; set; }
        public Avaliacao? Avaliacao { get; set; }
        public Pergunta? Pergunta { get; set; }
        public Resposta? Resposta { get; set; }
    } 
}