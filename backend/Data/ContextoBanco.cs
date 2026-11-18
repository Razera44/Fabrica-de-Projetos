using Avaliação_de_Segurança.Entities;
using Microsoft.EntityFrameworkCore;


namespace Avaliação_de_Segurança.Data
{
    public class ContextoBanco : DbContext
    {
        public ContextoBanco(DbContextOptions<ContextoBanco> options) : base(options) { }
        public DbSet<Empresa> Empresa { get; set; } = null!;
        public DbSet<Avaliacao> Avaliacao { get; set; } = null!;
        public DbSet<Pergunta> Pergunta { get; set; } = null!;
        public DbSet<Resposta> Resposta { get; set; } = null!;
        public DbSet<RespostaAvaliacao> RespostaAvaliacao { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Empresa>()
                .HasKey(empresa => empresa.Id);

            modelBuilder.Entity<Avaliacao>()
                .HasKey(avaliacao => avaliacao.Id);

            modelBuilder.Entity<Pergunta>()
                .HasKey(pergunta => pergunta.Id);

            modelBuilder.Entity<Resposta>()
                .HasKey(resposta => resposta.Id);

            modelBuilder.Entity<RespostaAvaliacao>()
                .HasKey(respostaAvaliacao => respostaAvaliacao.Id);

            modelBuilder.Entity<Empresa>()
                .HasMany<Avaliacao>(empresa => empresa.Avaliacoes)
                .WithOne(avaliacao => avaliacao.Empresa)
                .HasForeignKey(avaliacao => avaliacao.EmpresaId);

            modelBuilder.Entity<Avaliacao>()
                .HasMany<RespostaAvaliacao>(avaliacao => avaliacao.RespostasAvaliacao)
                .WithOne(respostaAvaliacao => respostaAvaliacao.Avaliacao)
                .HasForeignKey(respostaAvaliacao => respostaAvaliacao.AvaliacaoId);

            modelBuilder.Entity<Pergunta>()
                .HasMany<Resposta>(pergunta => pergunta.Respostas)
                .WithOne(resposta => resposta.Pergunta)
                .HasForeignKey(resposta => resposta.PerguntaId);

            modelBuilder.Entity<RespostaAvaliacao>()
                .HasOne(r => r.Pergunta)
                .WithMany()
                .HasForeignKey(r => r.PerguntaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RespostaAvaliacao>()
                .HasOne(r => r.Resposta)
                .WithMany()
                .HasForeignKey(r => r.RespostaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Empresa>()
                .Property(e => e.Nome).IsRequired().HasMaxLength(100);

            modelBuilder.Entity<Empresa>()
                .HasIndex(e => e.Nome).IsUnique();

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.EmpresaId).IsRequired();

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NomeResponsavel).IsRequired().HasMaxLength(100);

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.DataInicio).IsRequired();

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.Finalizada).IsRequired();

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NotaBackup).HasPrecision(5, 2);

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NotaAntivirus).HasPrecision(5, 2);

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NotaSenha).HasPrecision(5, 2);

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NotaLgpd).HasPrecision(5, 2);

            modelBuilder.Entity<Avaliacao>()
                .Property(a => a.NotaGeral).HasPrecision(5, 2);

            modelBuilder.Entity<Pergunta>()
                .Property(p => p.Texto).IsRequired().HasMaxLength(300);

            modelBuilder.Entity<Pergunta>()
                .Property(p => p.Categoria).IsRequired();

            modelBuilder.Entity<Resposta>()
                .Property(r => r.PerguntaId).IsRequired();

            modelBuilder.Entity<Resposta>()
                .Property(r => r.Texto).IsRequired().HasMaxLength(300);

            modelBuilder.Entity<Resposta>()
                .Property(r => r.Opcao).IsRequired();

            modelBuilder.Entity<Resposta>()
                .Property(r => r.Peso).IsRequired();

            modelBuilder.Entity<RespostaAvaliacao>()
                .Property(r => r.AvaliacaoId).IsRequired();

            modelBuilder.Entity<RespostaAvaliacao>()
                .Property(r => r.PerguntaId).IsRequired();

            modelBuilder.Entity<RespostaAvaliacao>()
                .Property(r => r.RespostaId).IsRequired();

            modelBuilder.Entity<RespostaAvaliacao>()
                .HasIndex(r => new { r.AvaliacaoId, r.PerguntaId }).IsUnique();

            modelBuilder.Entity<Pergunta>()
                .HasData(SeedBanco.ObterPerguntas());

            modelBuilder.Entity<Resposta>()
                .HasData(SeedBanco.ObterRespostas());

            base.OnModelCreating(modelBuilder);
        }
    }
}