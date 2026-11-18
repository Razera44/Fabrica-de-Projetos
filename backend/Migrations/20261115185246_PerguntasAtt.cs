using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Avaliação_de_Segurança.Migrations
{
    /// <inheritdoc />
    public partial class PerguntasAtt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 78);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 79);

            migrationBuilder.DeleteData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 80);

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 1,
                column: "Texto",
                value: "Sua empresa faz backup dos arquivos importantes?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 2,
                column: "Texto",
                value: "Onde fica armazenada a cópia de backup?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 3,
                column: "Texto",
                value: "Com que frequência o backup é atualizado?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 4,
                column: "Texto",
                value: "Você já testou restaurar um backup para ver se ele funciona?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 5,
                column: "Texto",
                value: "Se o computador principal quebrasse hoje, quanto tempo levaria pra empresa voltar a funcionar?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "As senhas dos sistemas da empresa são únicas entre si?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Os funcionários usam autenticação em duas etapas (2FA) nos acessos importantes?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Como as senhas são compartilhadas entre a equipe, quando necessário?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Ex-funcionários ainda têm acesso a algum sistema da empresa?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Com que frequência as senhas são trocadas ou revisadas?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Os computadores da empresa têm antivírus instalado?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "As atualizações do sistema operacional são feitas automaticamente?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Os dispositivos da empresa (celulares, notebooks) têm senha ou biometria de bloqueio?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "A empresa usa uma rede Wi-Fi separada para visitantes e para o negócio?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Já aconteceu algum caso de vírus, travamento suspeito ou sequestro de arquivos (ransomware)?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 16,
                column: "Texto",
                value: "A empresa sabe quais dados pessoais de clientes ela armazena?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 17,
                column: "Texto",
                value: "Existe uma política de privacidade visível para os clientes?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 18,
                column: "Texto",
                value: "Os dados dos clientes são compartilhados com terceiros (fornecedores, parceiros)?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 19,
                column: "Texto",
                value: "Se um cliente pedir para apagar seus dados, a empresa sabe como fazer isso?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 20,
                column: "Texto",
                value: "Algum funcionário já recebeu orientação sobre como tratar dados pessoais de clientes?");

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 1,
                column: "Texto",
                value: "Sim, automático e regular");

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Peso", "Texto" },
                values: new object[] { 50, "Sim, mas manual e irregular" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Peso", "Texto" },
                values: new object[] { 0, "Não faço backup" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 2, 100, "Em nuvem ou local externo, fora do computador principal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 2, 50, "No mesmo computador ou HD interno" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 3, 0, "Não sei / não tenho backup" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 3, 100, "Diariamente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 3, 50, "Semanalmente ou mensalmente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 3, 0, "Raramente ou nunca" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 4, 100, "Sim, já testei" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 2, 4, "Não, nunca testei" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 4, 0, "Não tenho backup pra testar" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 5, "Menos de 1 dia" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 5, 50, "Alguns dias" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 5, 0, "Não sei / levaria semanas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 6, 100, "Sim, cada sistema tem uma senha diferente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 6, 50, "Algumas são repetidas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 6, 0, "Uso a mesma senha em quase tudo" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 7, 100, "Sim, na maioria dos acessos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 7, 50, "Em alguns" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 7, 0, "Não uso" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 8, 100, "Por um gerenciador de senhas seguro" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 2, 8, "Por WhatsApp, papel ou planilha" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 8, 0, "Não compartilhamos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 9, "Não, os acessos são removidos ao sair" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 9, 50, "Não sei dizer" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 9, 0, "Sim, provavelmente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 10, 100, "Periodicamente, seguindo uma rotina" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 10, 50, "Só quando esqueço ou dá problema" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 10, 0, "Nunca trocamos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 11, 100, "Sim, em todos e atualizado" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 11, 50, "Em alguns" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 11, 0, "Não tenho antivírus" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 12, 100, "Sim, automáticas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 2, 12, "Às vezes, manualmente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 12, 0, "Não atualizo" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 13, "Sim, todos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 13, 50, "Alguns" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 13, 0, "Nenhum" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 14, 100, "Sim, redes separadas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 14, 50, "Não, é a mesma rede pra tudo" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 14, 0, "Não sei" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 15, 100, "Nunca" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 44,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 15, 50, "Já aconteceu, mas resolvemos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 15, 0, "Já aconteceu e perdemos dados" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 16, 100, "Sim, temos isso mapeado" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 2, 16, "Mais ou menos, não é formalizado" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 48,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 16, 0, "Não sei dizer" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 17, "Sim, publicada e atualizada" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 17, 50, "Existe, mas está desatualizada" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 17, 0, "Não existe" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 52,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 18, 100, "Não compartilhamos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 18, 50, "Compartilhamos com consentimento formal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 18, 0, "Compartilhamos sem controle definido" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 19, 100, "Sim, temos um processo definido" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 19, 50, "Saberíamos resolver na hora" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 57,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 19, 0, "Não saberíamos o que fazer" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 58,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 20, 100, "Sim, todos foram orientados" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 2, 20, "Só alguns" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 20, 0, "Ninguém recebeu orientação" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 1,
                column: "Texto",
                value: "Com que frequência a empresa realiza backup dos seus dados?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 2,
                column: "Texto",
                value: "Onde os backups são armazenados?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 3,
                column: "Texto",
                value: "Com que frequência a restauração dos backups é testada?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 4,
                column: "Texto",
                value: "Os backups são protegidos por criptografia?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 5,
                column: "Texto",
                value: "Existe um plano de recuperação de desastres documentado?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Existe antivírus instalado nos computadores e servidores da empresa?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Com que frequência o antivírus é atualizado?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "São realizadas varreduras completas nos dispositivos?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Como é feito o controle do uso de dispositivos externos (pen drives, HDs)?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 2, "Os colaboradores recebem treinamento sobre phishing e outras ameaças?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Qual o padrão de complexidade exigido para as senhas?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "A empresa utiliza autenticação em dois fatores (2FA)?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Com que frequência as senhas são trocadas?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Como as senhas são armazenadas e compartilhadas?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "Categoria", "Texto" },
                values: new object[] { 3, "Como são tratados os acessos de ex-colaboradores?" });

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 16,
                column: "Texto",
                value: "A empresa possui um Encarregado de Dados (DPO)?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 17,
                column: "Texto",
                value: "A empresa possui o mapeamento dos dados pessoais que trata?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 18,
                column: "Texto",
                value: "A empresa possui política de privacidade e registro de consentimento?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 19,
                column: "Texto",
                value: "Como a empresa atende às solicitações dos titulares de dados?");

            migrationBuilder.UpdateData(
                table: "Pergunta",
                keyColumn: "Id",
                keyValue: 20,
                column: "Texto",
                value: "Existe um plano de resposta a incidentes com dados pessoais?");

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 1,
                column: "Texto",
                value: "Diariamente, de forma automática");

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Peso", "Texto" },
                values: new object[] { 75, "Semanalmente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Peso", "Texto" },
                values: new object[] { 50, "Mensalmente ou de forma esporádica" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 1, 25, "Nunca realiza backup" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 1, 100, "Em nuvem e em mídia externa, em locais diferentes" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 2, 75, "Em nuvem ou em um local externo à empresa" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 2, 50, "No mesmo computador ou servidor dos dados originais" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 2, 25, "Não existe um local definido" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Opcao", "Peso", "Texto" },
                values: new object[] { 1, 100, "Periodicamente, com registro dos testes" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 3, 75, "Pelo menos uma vez ao ano" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 3, 3, "Apenas quando há necessidade" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 3, 25, "Nunca foi testada" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 4, "Sim, todos criptografados e com acesso restrito" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 14,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 75, "Sim, apenas parte deles" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 15,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 50, "Apenas protegidos por uma senha simples" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 16,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 4, 25, "Não possuem nenhuma proteção" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 17,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 5, 100, "Sim, documentado, testado e conhecido pela equipe" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 18,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 5, 75, "Sim, documentado, mas nunca testado" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 19,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 5, 50, "Existe apenas de maneira informal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 20,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 5, 25, "Não existe nenhum plano" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 21,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 6, 100, "Em todos os dispositivos, com solução corporativa" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 22,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 6, 75, "Em todos os dispositivos, com solução gratuita" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 23,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 3, 6, "Apenas em alguns dispositivos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 24,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 6, 25, "Em nenhum dispositivo" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 25,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 7, "Automaticamente e em tempo real" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 26,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 7, 75, "Diariamente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 27,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 7, 50, "Raramente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 28,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 7, 25, "Nunca é atualizado" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 29,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 8, 100, "Sim, agendadas semanalmente de forma automática" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 30,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 8, 75, "Sim, mensalmente" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 31,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 8, 50, "Apenas quando há suspeita de infecção" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 32,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 8, 25, "Nunca são realizadas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 33,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 9, 100, "Bloqueio ou verificação obrigatória antes do uso" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 34,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 9, 75, "Verificação automática pelo antivírus" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 35,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 3, 9, "Uso liberado, com orientação verbal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 36,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 9, 25, "Uso liberado, sem nenhum controle" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 37,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 10, "Treinamentos periódicos com simulações" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 38,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 10, 75, "Treinamento anual" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 39,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 10, 50, "Apenas orientações pontuais" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 40,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 10, 25, "Nenhum treinamento" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 41,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 11, 100, "Mínimo de 12 caracteres com letras, números e símbolos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 42,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 11, 75, "Mínimo de 8 caracteres com letras e números" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 43,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 11, 50, "Mínimo de 6 caracteres, sem regras adicionais" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 44,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 11, 25, "Não há nenhuma exigência" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 45,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 12, 100, "Sim, em todos os sistemas críticos" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 46,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 12, 75, "Sim, nos principais sistemas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 47,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 3, 12, "Apenas em poucos sistemas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 48,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 12, 25, "Não utiliza" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 49,
                columns: new[] { "PerguntaId", "Texto" },
                values: new object[] { 13, "Periodicamente e sempre após incidentes" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 50,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 13, 75, "A cada 6 ou 12 meses" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 51,
                columns: new[] { "PerguntaId", "Peso", "Texto" },
                values: new object[] { 13, 50, "Apenas quando são esquecidas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 52,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 13, 25, "Nunca são trocadas" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 53,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 14, 100, "Em um gerenciador de senhas corporativo" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 54,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 14, 75, "Em um gerenciador de senhas pessoal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 55,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 3, 14, 50, "Em planilhas ou anotações" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 56,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 14, 25, "Em conversas ou anotadas em locais visíveis" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 57,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 1, 15, 100, "Revogados imediatamente, em processo formal" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 58,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 2, 15, 75, "Revogados em poucos dias" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 59,
                columns: new[] { "Opcao", "PerguntaId", "Texto" },
                values: new object[] { 3, 15, "Revogados apenas quando alguém lembra" });

            migrationBuilder.UpdateData(
                table: "Resposta",
                keyColumn: "Id",
                keyValue: 60,
                columns: new[] { "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[] { 4, 15, 25, "Nunca são revogados" });

            migrationBuilder.InsertData(
                table: "Resposta",
                columns: new[] { "Id", "Opcao", "PerguntaId", "Peso", "Texto" },
                values: new object[,]
                {
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
        }
    }
}
