namespace Avaliação_de_Segurança.DTOs
{
    public class AvaliacaoIniciadaResponse
    {
        public int AvaliacaoId { get; set; }
        public int EmpresaId { get; set; }
        public string NomeEmpresa { get; set; }
        public string NomeResponsavel { get; set; }
        public List<PerguntaResponse> Perguntas { get; set; }
    }
}