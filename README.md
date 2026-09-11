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
   a evolução da nota ao longo do tempo.

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
