namespace Avaliação_de_Segurança.Entities
{
    public class Empresa
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public virtual List<Avaliacao> Avaliacoes { get; set; }
    }
}