const base = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')

async function request(path, options = {}) {
  let response
  try { response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  }) } catch {
    throw new Error('Não foi possível conectar à API. Inicie o servidor ASP.NET na porta 5000.')
  }
  if (!response.ok) {
    const detail = (await response.text()).trim()
    if (response.status === 500 && (!detail || detail.includes('ECONNREFUSED') || detail.includes('proxy error')))
      throw new Error('A API não está disponível na porta 5000. Inicie o servidor ASP.NET.')
    if (response.status === 503) throw new Error(detail || 'Configure AI_API_KEY e AI_MODEL no servidor para usar o assistente.')
    throw new Error(detail && detail.length < 250 ? detail : `Erro ${response.status} ao consultar a API.`)
  }
  const body = await response.text()
  try { return JSON.parse(body) } catch { return body }
}

export async function sendAssessment(companyName, responsavel, answers) {
  const companies = await request('/empresa/Listar')
  let company = companies.find(item => item.nome.trim().toLocaleLowerCase() === companyName.trim().toLocaleLowerCase())
  if (!company) {
    await request('/empresa/Cadastrar', { method: 'POST', body: JSON.stringify({ nome: companyName }) })
    company = (await request('/empresa/Listar')).find(item => item.nome.trim().toLocaleLowerCase() === companyName.trim().toLocaleLowerCase())
  }
  if (!company) throw new Error('Empresa não encontrada após o cadastro.')
  const started = await request('/avaliacao/Iniciar', {
    method: 'POST', body: JSON.stringify({ empresaId: company.id, nomeResponsavel: responsavel || 'Não informado' })
  })
  if (started.perguntas.length !== answers.length) throw new Error('O questionário da API não corresponde ao formulário.')
  for (let index = 0; index < answers.length; index++) {
    const question = started.perguntas[index]
    const answer = question.respostas[answers[index]]
    if (!answer) throw new Error(`Resposta inválida na pergunta ${index + 1}.`)
    await request('/avaliacao/Responder', {
      method: 'POST', body: JSON.stringify({ avaliacaoId: started.avaliacaoId, perguntaId: question.id, respostaId: answer.id })
    })
  }
  return request(`/avaliacao/Finalizar?id=${started.avaliacaoId}`, { method: 'POST' })
}

export function askAssistant(question, scores, companyName) {
  return request('/assistente', {
    method: 'POST', body: JSON.stringify({ pergunta: question, notas: scores, empresa: companyName })
  })
}
