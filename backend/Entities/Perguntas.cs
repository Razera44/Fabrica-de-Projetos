using Avaliação_de_Segurança.Enums;

namespace Avaliação_de_Segurança.Entities
{
    public class Pergunta
    {
        public int Id { get; set; }
        public string Texto { get; set; }
        public CategoriaPergunta Categoria { get; set; }
        public virtual List<Resposta> Respostas { get; set; }
    }
}