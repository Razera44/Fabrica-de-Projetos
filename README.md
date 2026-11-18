# Segura. — Autoavaliação de Segurança Digital

Questionário web para pequenas empresas descobrirem o nível de segurança digital do negócio,
sem precisar contratar uma consultoria.

## Como funciona

1. A empresa responde 20 perguntas, divididas em 4 temas: **Backup**, **Senhas**, **Antivírus** e **LGPD**.
2. Cada resposta vale 100, 50 ou 0 pontos (da mais segura pra mais arriscada).
3. A nota de cada tema é a média das suas 5 perguntas.
4. A nota geral é a média ponderada dos temas:
   - Backup: 30%
   - Senhas: 25%
   - Antivírus: 20%
   - LGPD: 25%
5. O tema com menor nota é destacado como "mais frágil", e um plano de ação é montado
   automaticamente, priorizado do tema mais fraco para o mais forte.
6. Cada avaliação concluída é salva no `localStorage` do navegador, permitindo comparar
   a evolução da nota ao longo do tempo. O histórico guarda até 200 avaliações **por empresa**
   (a mais antiga da própria empresa sai primeiro; outras empresas não são afetadas). Se o
   navegador não deixar gravar (cota cheia), a tela de resultados avisa.

## Stack

- Vue 3 (Options API)
- Vite
- Sem backend — persistência via `localStorage`

## Rodando o projeto

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  data/
    questions.js       # as 20 perguntas, agrupadas por tema
    actionLibrary.js    # ações recomendadas por tema/faixa de risco
  utils/
    scoring.js          # cálculo de nota, tema mais frágil e plano de ação
    storage.js           # leitura/escrita no localStorage
  components/
    AppHeader.vue
    IntroScreen.vue
    ProgressBand.vue
    QuestionCard.vue
    DoneScreen.vue
    GaugeChart.vue
    ThemeCard.vue
    WeakThemeCard.vue
    ActionPlanList.vue
    HistoryPanel.vue
    ResultsView.vue
  App.vue
```

## Próximos passos possíveis

- Editar os pesos dos temas ou adicionar novos temas em `src/data/questions.js` e
  `src/utils/scoring.js`.
- Permitir exportar o resultado em PDF.
- Trocar o `localStorage` por um backend, caso precise comparar várias empresas
  ou acessar o histórico de outro dispositivo.
# API e assistente

O back-end ASP.NET está em `backend/`. Configure a conexão MySQL `ConnectionStrings__Local` no ambiente. Execute `npm run dev` na raiz do projeto: esse comando inicia a API na porta 5000, inicia o Vite e abre o site no navegador. Se a API já estiver ativa na porta 5000, ela será reutilizada. Avaliações concluídas continuam salvas no navegador e também são enviadas à API quando o banco está disponível.

Para ativar o assistente, abra `backend/ai.local.json` e substitua `COLE_SUA_API_KEY_AQUI` pela chave do Gemini. O modelo Gemini configurado já está definido. Reinicie a API após preencher a chave. O arquivo é ignorado pelo Git; não envie a chave ao repositório.

Em produção, defina `VITE_API_URL` para a URL pública da API ou encaminhe `/api` no servidor web. Restrinja as origens CORS em `backend/Program.cs` ao domínio publicado.
