using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Avaliação_de_Segurança.Migrations
{
    /// <inheritdoc />
    public partial class BancoProjeto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Empresa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Nome = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresa", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Pergunta",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Texto = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Categoria = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pergunta", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Avaliacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmpresaId = table.Column<int>(type: "int", nullable: false),
                    NomeResponsavel = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DataInicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DataFinalizacao = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Finalizada = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    NotaBackup = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    NotaAntivirus = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    NotaSenha = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    NotaLgpd = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    NotaGeral = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    Classificacao = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Avaliacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Avaliacao_Empresa_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Resposta",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PerguntaId = table.Column<int>(type: "int", nullable: false),
                    Texto = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Opcao = table.Column<int>(type: "int", nullable: false),
                    Peso = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resposta", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resposta_Pergunta_PerguntaId",
                        column: x => x.PerguntaId,
                        principalTable: "Pergunta",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RespostaAvaliacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    AvaliacaoId = table.Column<int>(type: "int", nullable: false),
                    PerguntaId = table.Column<int>(type: "int", nullable: false),
                    RespostaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RespostaAvaliacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RespostaAvaliacao_Avaliacao_AvaliacaoId",
                        column: x => x.AvaliacaoId,
                        principalTable: "Avaliacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RespostaAvaliacao_Pergunta_PerguntaId",
                        column: x => x.PerguntaId,
                        principalTable: "Pergunta",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RespostaAvaliacao_Resposta_RespostaId",
                        column: x => x.RespostaId,
                        principalTable: "Resposta",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Pergunta",
                columns: new[] { "Id", "Categoria", "Texto" },
                values: new object[,]
                {
                    { 1, 1, "Com que frequência a empresa realiza backup dos seus dados?" },
                    { 2, 1, "Onde os backups são armazenados?" },
                    { 3, 1, "Com que frequência a restauração dos backups é testada?" },
                    { 4, 1, "Os backups são protegidos por criptografia?" },
                    { 5, 1, "Existe um plano de recuperação de desastres documentado?" },
                    { 6, 2, "Existe antivírus instalado nos computadores e servidores da empresa?" },
                    { 7, 2, "Com que frequência o antivírus é atualizado?" },
                    { 8, 2, "São realizadas varreduras completas nos dispositivos?" },
                    { 9, 2, "Como é feito o controle do uso de dispositivos externos (pen drives, HDs)?" },
                    { 10, 2, "Os colaboradores recebem treinamento sobre phishing e outras ameaças?" },
                    { 11, 3, "Qual o padrão de complexidade exigido para as senhas?" },
                    { 12, 3, "A empresa utiliza autenticação em dois fatores (2FA)?" },
                    { 13, 3, "Com que frequência as senhas são trocadas?" },
                    { 14, 3, "Como as senhas são armazenadas e compartilhadas?" },
                    { 15, 3, "Como são tratados os acessos de ex-colaboradores?" },
                    { 16, 4, "A empresa possui um Encarregado de Dados (DPO)?" },
                    { 17, 4, "A empresa possui o mapeamento dos dados pessoais que trata?" },
                    { 18, 4, "A empresa possui política de privacidade e registro de consentimento?" },
                    { 19, 4, "Como a empresa atende às solicitações dos titulares de dados?" },
                    { 20, 4, "Existe um plano de resposta a incidentes com dados pessoais?" }
                });

            migrationBuilder.InsertData(
                table: "Resposta",
                columns: new[] { "Id", "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[,]
                {
                    { 1, 1, 1, 100, "Diariamente, de forma automática" },
                    { 2, 2, 1, 75, "Semanalmente" },
                    { 3, 3, 1, 50, "Mensalmente ou de forma esporádica" },
                    { 4, 4, 1, 25, "Nunca realiza backup" },
                    { 5, 1, 2, 100, "Em nuvem e em mídia externa, em locais diferentes" },
                    { 6, 2, 2, 75, "Em nuvem ou em um local externo à empresa" },
                    { 7, 3, 2, 50, "No mesmo computador ou servidor dos dados originais" },
                    { 8, 4, 2, 25, "Não existe um local definido" },
                    { 9, 1, 3, 100, "Periodicamente, com registro dos testes" },
                    { 10, 2, 3, 75, "Pelo menos uma vez ao ano" },
                    { 11, 3, 3, 50, "Apenas quando há necessidade" },
                    { 12, 4, 3, 25, "Nunca foi testada" },
                    { 13, 1, 4, 100, "Sim, todos criptografados e com acesso restrito" },
                    { 14, 2, 4, 75, "Sim, apenas parte deles" },
                    { 15, 3, 4, 50, "Apenas protegidos por uma senha simples" },
                    { 16, 4, 4, 25, "Não possuem nenhuma proteção" },
                    { 17, 1, 5, 100, "Sim, documentado, testado e conhecido pela equipe" },
                    { 18, 2, 5, 75, "Sim, documentado, mas nunca testado" },
                    { 19, 3, 5, 50, "Existe apenas de maneira informal" },
                    { 20, 4, 5, 25, "Não existe nenhum plano" },
                    { 21, 1, 6, 100, "Em todos os dispositivos, com solução corporativa" },
                    { 22, 2, 6, 75, "Em todos os dispositivos, com solução gratuita" },
                    { 23, 3, 6, 50, "Apenas em alguns dispositivos" },
                    { 24, 4, 6, 25, "Em nenhum dispositivo" },
                    { 25, 1, 7, 100, "Automaticamente e em tempo real" },
                    { 26, 2, 7, 75, "Diariamente" },
                    { 27, 3, 7, 50, "Raramente" },
                    { 28, 4, 7, 25, "Nunca é atualizado" },
                    { 29, 1, 8, 100, "Sim, agendadas semanalmente de forma automática" },
                    { 30, 2, 8, 75, "Sim, mensalmente" },
                    { 31, 3, 8, 50, "Apenas quando há suspeita de infecção" },
                    { 32, 4, 8, 25, "Nunca são realizadas" },
                    { 33, 1, 9, 100, "Bloqueio ou verificação obrigatória antes do uso" },
                    { 34, 2, 9, 75, "Verificação automática pelo antivírus" },
                    { 35, 3, 9, 50, "Uso liberado, com orientação verbal" },
                    { 36, 4, 9, 25, "Uso liberado, sem nenhum controle" },
                    { 37, 1, 10, 100, "Treinamentos periódicos com simulações" },
                    { 38, 2, 10, 75, "Treinamento anual" },
                    { 39, 3, 10, 50, "Apenas orientações pontuais" },
                    { 40, 4, 10, 25, "Nenhum treinamento" },
                    { 41, 1, 11, 100, "Mínimo de 12 caracteres com letras, números e símbolos" },
                    { 42, 2, 11, 75, "Mínimo de 8 caracteres com letras e números" },
                    { 43, 3, 11, 50, "Mínimo de 6 caracteres, sem regras adicionais" },
                    { 44, 4, 11, 25, "Não há nenhuma exigência" },
                    { 45, 1, 12, 100, "Sim, em todos os sistemas críticos" },
                    { 46, 2, 12, 75, "Sim, nos principais sistemas" },
                    { 47, 3, 12, 50, "Apenas em poucos sistemas" },
                    { 48, 4, 12, 25, "Não utiliza" },
                    { 49, 1, 13, 100, "Periodicamente e sempre após incidentes" },
                    { 50, 2, 13, 75, "A cada 6 ou 12 meses" },
                    { 51, 3, 13, 50, "Apenas quando são esquecidas" },
                    { 52, 4, 13, 25, "Nunca são trocadas" },
                    { 53, 1, 14, 100, "Em um gerenciador de senhas corporativo" },
                    { 54, 2, 14, 75, "Em um gerenciador de senhas pessoal" },
                    { 55, 3, 14, 50, "Em planilhas ou anotações" },
                    { 56, 4, 14, 25, "Em conversas ou anotadas em locais visíveis" },
                    { 57, 1, 15, 100, "Revogados imediatamente, em processo formal" },
                    { 58, 2, 15, 75, "Revogados em poucos dias" },
                    { 59, 3, 15, 50, "Revogados apenas quando alguém lembra" },
                    { 60, 4, 15, 25, "Nunca são revogados" },
                    { 61, 1, 16, 100, "Sim, formalmente nomeado e divulgado" },
                    { 62, 2, 16, 75, "Sim, nomeado, mas pouco divulgado" },
                    { 63, 3, 16, 50, "Existe um responsável apenas de maneira informal" },
                    { 64, 4, 16, 25, "Não possui" },
                    { 65, 1, 17, 100, "Sim, completo e atualizado" },
                    { 66, 2, 17, 75, "Sim, completo, mas desatualizado" },
                    { 67, 3, 17, 50, "Apenas parcial" },
                    { 68, 4, 17, 25, "Não possui nenhum mapeamento" },
                    { 69, 1, 18, 100, "Política publicada e consentimento registrado" },
                    { 70, 2, 18, 75, "Política publicada e consentimento parcial" },
                    { 71, 3, 18, 50, "Política desatualizada ou incompleta" },
                    { 72, 4, 18, 25, "Não possui" },
                    { 73, 1, 19, 100, "Por canal formal, com prazos definidos" },
                    { 74, 2, 19, 75, "Por e-mail, sem prazos definidos" },
                    { 75, 3, 19, 50, "Atende sem um processo definido" },
                    { 76, 4, 19, 25, "Não atende ou não sabe como atender" },
                    { 77, 1, 20, 100, "Sim, formal, com comunicação à ANPD e aos titulares" },
                    { 78, 2, 20, 75, "Sim, formal, mas nunca testado" },
                    { 79, 3, 20, 50, "Apenas ações isoladas" },
                    { 80, 4, 20, 25, "Não existe nenhum plano" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Avaliacao_EmpresaId",
                table: "Avaliacao",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empresa_Nome",
                table: "Empresa",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resposta_PerguntaId",
                table: "Resposta",
                column: "PerguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_RespostaAvaliacao_AvaliacaoId_PerguntaId",
                table: "RespostaAvaliacao",
                columns: new[] { "AvaliacaoId", "PerguntaId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RespostaAvaliacao_PerguntaId",
                table: "RespostaAvaliacao",
                column: "PerguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_RespostaAvaliacao_RespostaId",
                table: "RespostaAvaliacao",
                column: "RespostaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RespostaAvaliacao");

            migrationBuilder.DropTable(
                name: "Avaliacao");

            migrationBuilder.DropTable(
                name: "Resposta");

            migrationBuilder.DropTable(
                name: "Empresa");

            migrationBuilder.DropTable(
                name: "Pergunta");
        }
    }
}
