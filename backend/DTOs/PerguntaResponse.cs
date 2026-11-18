using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.DTOs
{
    public class PerguntaResponse
    {
        public int Id { get; set; }
        public string Texto { get; set; }
        public CategoriaPergunta Categoria { get; set; }
        public List<RespostaResponse> Respostas { get; set; }
    }
}