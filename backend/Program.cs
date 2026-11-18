using Avaliação_de_Segurança.Data;
using Avaliação_de_Segurança.Data.Repositories;
using Avaliação_de_Segurança.Interfaces;
using Avaliação_de_Segurança.Services;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var aiConfigPath = File.Exists("backend/ai.local.json") ? "backend/ai.local.json" : "ai.local.json";
builder.Configuration.AddJsonFile(aiConfigPath, optional: true, reloadOnChange: true);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy => policy
    .SetIsOriginAllowed(origin => Uri.TryCreate(origin, UriKind.Absolute, out var uri)
        && uri.Scheme == "http" && (uri.Host == "localhost" || uri.Host == "127.0.0.1"))
    .AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddScoped<IEmpresaService, EmpresaService>();
builder.Services.AddScoped<IAvaliacaoService, AvaliacaoService>();
builder.Services.AddScoped<IEmpresaRepository, EmpresaRepository>();
builder.Services.AddScoped<IPerguntaRepository, PerguntaRepository>();
builder.Services.AddScoped<IAvaliacaoRepository, AvaliacaoRepository>();

string mySqlConnection = builder.Configuration.GetConnectionString("Local");
var serverVersion = new MySqlServerVersion(new Version(8, 0, 30));
builder.Services.AddDbContext<ContextoBanco>(options => options.UseMySql(mySqlConnection, serverVersion));

var app = builder.Build();

try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ContextoBanco>();
    db.Database.EnsureCreated();
}
catch (Exception ex)
{
    // O provedor EventLog do Windows pode lançar outra exceção ao tentar registrar
    // esse aviso em máquinas sem permissão para gravar no log de eventos. Isso não
    // deve impedir o servidor e o assistente de iniciarem sem o MySQL.
    Console.Error.WriteLine($"MySQL indisponível ({ex.GetBaseException().Message}). O site e o assistente podem iniciar; a sincronização das avaliações aguardará o banco.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseCors("Frontend");

app.MapControllers();

app.Run();
