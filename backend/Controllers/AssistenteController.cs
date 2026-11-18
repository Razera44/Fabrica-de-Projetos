using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Avaliação_de_Segurança.Controllers;

public record PerguntaAssistente(string Pergunta, Dictionary<string, decimal> Notas, string Empresa);

[ApiController]
[Route("api/assistente")]
public class AssistenteController(IHttpClientFactory clients, IConfiguration config) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Perguntar([FromBody] PerguntaAssistente input, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input.Pergunta) || input.Pergunta.Length > 1000)
            return BadRequest("Escreva uma pergunta de até 1000 caracteres.");

        var key = config["AI_API_KEY"] ?? config["AI:ApiKey"];
        var model = config["AI_MODEL"] ?? config["AI:Model"];
        if (string.IsNullOrWhiteSpace(key) || key == "COLE_SUA_API_KEY_AQUI" || string.IsNullOrWhiteSpace(model))
            return StatusCode(503, "Preencha ApiKey em backend/ai.local.json para habilitar o assistente.");

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent";
        var payload = new {
            systemInstruction = new { parts = new[] { new { text = "Você é um assistente de segurança digital para pequenas empresas. Responda em português brasileiro, em até 120 palavras. Seja direto e prático. Use as notas fornecidas como contexto, sem inventar dados. Para decisões críticas, recomende um profissional." } } },
            contents = new[] { new { role = "user", parts = new[] { new { text = $"Empresa: {input.Empresa}. Notas: {JsonSerializer.Serialize(input.Notas)}. Pergunta: {input.Pergunta}" } } } },
            generationConfig = new {
                maxOutputTokens = 384,
                thinkingConfig = new { thinkingLevel = "MINIMAL" }
            }
        };
        try {
            using var client = clients.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(20);
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Add("x-goog-api-key", key);
            request.Content = JsonContent.Create(payload);
            using var response = await client.SendAsync(request, cancellationToken);
            {
            if (!response.IsSuccessStatusCode)
            {
                var code = "";
                try
                {
                    using var errorJson = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
                    if (errorJson.RootElement.TryGetProperty("error", out var error) &&
                        error.TryGetProperty("status", out var errorStatus))
                        code = errorStatus.GetString() ?? "";
                }
                catch (JsonException) { }

                var message = (int)response.StatusCode switch
                {
                    400 when code == "API_KEY_INVALID" => "A chave do Gemini foi recusada. Confira ApiKey em backend/ai.local.json.",
                    400 when code == "RESOURCE_EXHAUSTED" => "A cota gratuita do Gemini foi atingida. Aguarde o limite renovar ou confira a cota do projeto no AI Studio.",
                    400 => "O Gemini recusou a solicitação. Confira o modelo e o formato da chave.",
                    401 => "A chave do Gemini foi recusada. Confira ApiKey em backend/ai.local.json.",
                    403 => "Esta chave não tem acesso ao modelo configurado.",
                    404 => "O modelo configurado não foi encontrado ou não está disponível para esta chave.",
                    429 when code is "RESOURCE_EXHAUSTED" => "A cota gratuita do Gemini foi atingida. Aguarde o limite renovar ou confira a cota do projeto no AI Studio.",
                    429 => "O provedor limitou as solicitações. Aguarde um momento e tente novamente.",
                    503 or 502 or 504 => "O Gemini está temporariamente indisponível ou sobrecarregado. Aguarde alguns segundos antes de tentar novamente.",
                    _ => $"O provedor de IA retornou erro {(int)response.StatusCode}. Tente novamente."
                };
                return StatusCode(502, message);
            }
            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(cancellationToken), cancellationToken: cancellationToken);
            var answer = string.Join("\n", json.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts").EnumerateArray().Select(part => part.GetProperty("text").GetString()).Where(text => !string.IsNullOrWhiteSpace(text)));
            return Ok(new { resposta = answer });
            }
        } catch (HttpRequestException) { return StatusCode(502, "Não foi possível acessar o provedor de IA."); }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested) { return StatusCode(504, "O Gemini demorou demais para responder. Tente novamente."); }
        catch (JsonException) { return StatusCode(502, "O provedor de IA retornou uma resposta inválida."); }
        catch (KeyNotFoundException) { return StatusCode(502, "O provedor de IA retornou uma resposta inesperada."); }
        catch (InvalidOperationException) { return StatusCode(502, "O provedor de IA retornou uma resposta inesperada."); }
    }
}
