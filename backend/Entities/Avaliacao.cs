using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.Entities
{
    public class Avaliacao
    {
        public int Id { get; set; }
        public int EmpresaId { get; set; }
        public string NomeResponsavel { get; set; }
        public DateTime DataInicio { get; set; }
        public DateTime? DataFinalizacao { get; set; }
        public bool Finalizada { get; set; }
        public decimal? NotaBackup { get; set; }
        public decimal? NotaAntivirus { get; set; }
        public decimal? NotaSenha { get; set; }
        public decimal? NotaLgpd { get; set; }
        public decimal? NotaGeral { get; set; }
        public ClassificacaoGeral? Classificacao { get; set; }
        public Empresa? Empresa { get; set; }
        public virtual List<RespostaAvaliacao> RespostasAvaliacao { get; set; }
    }
}