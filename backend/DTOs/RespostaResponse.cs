using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.DTOs
{
    public class RespostaResponse
    {
        public int Id { get; set; }
        public string Texto { get; set; }
        public OpcaoResposta Opcao { get; set; }
    }
}