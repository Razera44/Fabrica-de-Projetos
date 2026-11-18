using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.DTOs
{
    public class ResultadoAvaliacaoResponse
    {
        public int AvaliacaoId { get; set; }
        public string NomeEmpresa { get; set; }
        public string NomeResponsavel { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime? DataFinalizacao { get; set; }
        public decimal NotaBackup { get; set; }
        public decimal NotaAntivirus { get; set; }
        public decimal NotaSenha { get; set; }
        public decimal NotaLgpd { get; set; }
        public decimal NotaGeral { get; set; }
        public ClassificacaoGeral Classificacao { get; set; }
    }
}