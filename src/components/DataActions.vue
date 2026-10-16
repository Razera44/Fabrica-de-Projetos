<template>
  <div class="da">
    <!-- hierarquia: PDF é a ação principal; JSON é backup/restauração -->
    <div class="da__bar">
      <button type="button" class="btn btn--primary da__pdf" :disabled="busy !== null" @click="doPdf">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v13m0 0-4.5-4.5M12 16l4.5-4.5M4 20h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ busy === 'pdf' ? 'Gerando PDF…' : 'Baixar relatório PDF' }}</span>
      </button>

      <div class="da__group" role="group" aria-label="Backup do histórico em JSON">
        <span class="da__gk">Backup (JSON)</span>
        <button type="button" class="btn btn--ghost" :disabled="busy !== null || !entries.length" @click="doExport">
          {{ busy === 'export' ? 'Exportando…' : 'Exportar' }}
        </button>
        <button type="button" class="btn btn--ghost" :disabled="busy !== null" @click="openPicker">
          Importar
        </button>
        <input ref="file" type="file" accept=".json,application/json" class="da__file" tabindex="-1" aria-hidden="true" @change="onPick" />
      </div>
    </div>

    <!-- área de importação: aceita arrastar ou o botão acima -->
    <div
      class="da__drop"
      :class="{ 'is-over': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <span>Arraste um arquivo <b>.json</b> exportado pelo app aqui para importar</span>
    </div>

    <!-- prévia da importação: nada é gravado antes da confirmação -->
    <div v-if="preview" class="da__preview" role="region" aria-label="Prévia da importação">
      <div class="da__ph">
        <b>{{ preview.fileName }}</b>
        <span>formato v{{ preview.schemaVersion }}<template v-if="preview.companyName"> · exportado de “{{ preview.companyName }}”</template></span>
      </div>

      <ul class="da__counts">
        <li><b>{{ preview.valid.length }}</b> válidas</li>
        <li><b>{{ plan.toAdd.length }}</b> novas</li>
        <li><b>{{ plan.duplicates.length }}</b> já existem</li>
        <li :class="{ 'is-bad': preview.invalid.length }"><b>{{ preview.invalid.length }}</b> inválidas (ignoradas)</li>
      </ul>

      <details v-if="preview.invalid.length" class="da__inv">
        <summary>Ver motivos das inválidas</summary>
        <ul>
          <li v-for="iv in preview.invalid.slice(0, 20)" :key="iv.index">Registro {{ iv.index + 1 }}: {{ iv.reason }}</li>
          <li v-if="preview.invalid.length > 20">… e mais {{ preview.invalid.length - 20 }}</li>
        </ul>
      </details>

      <fieldset class="da__strat" :disabled="busy !== null">
        <legend>O que fazer com o histórico de “{{ companyName }}”?</legend>
        <label>
          <input v-model="strategy" type="radio" value="merge" />
          <span><b>Mesclar</b> — adiciona as {{ plan.toAdd.length }} novas e mantém as {{ plan.existingCount }} atuais. Duplicadas são ignoradas.</span>
        </label>
        <label>
          <input v-model="strategy" type="radio" value="replace" />
          <span><b>Substituir</b> — apaga as {{ plan.existingCount }} avaliações atuais (inclusive a que acabou de fazer) e restaura as {{ preview.valid.length }} do arquivo.</span>
        </label>
        <label v-if="strategy === 'replace'" class="da__confirm">
          <input v-model="confirmReplace" type="checkbox" />
          <span>Entendo que as avaliações atuais serão perdidas.</span>
        </label>
      </fieldset>

      <div class="da__pa">
        <button type="button" class="btn btn--ghost" :disabled="busy !== null" @click="cancel">Cancelar</button>
        <button
          type="button"
          class="btn btn--primary"
          :disabled="!canApply"
          @click="apply"
        >{{ busy === 'import' ? 'Importando…' : applyLabel }}</button>
      </div>
    </div>

    <p class="da__msg" :class="msg ? `is-${msg.kind}` : ''" role="status" aria-live="polite">{{ msg ? msg.text : '' }}</p>
  </div>
</template>

<script>
import {
  buildExport, exportFileName, parseImport, planImport, applyImport, MAX_IMPORT_BYTES
} from '../utils/storage.js'

export default {
  name: 'DataActions',
  props: {
    companyName: { type: String, required: true },
    entries: { type: Array, required: true },
    questions: { type: Array, required: true },
    // função assíncrona que gera e baixa o PDF (fica no ResultsView)
    makePdf: { type: Function, required: true }
  },
  emits: ['imported'],
  data() {
    return { busy: null, msg: null, preview: null, strategy: 'merge', confirmReplace: false, dragOver: false }
  },
  computed: {
    plan() {
      return this.preview ? planImport(this.entries, this.preview.valid) : { toAdd: [], duplicates: [], existingCount: 0 }
    },
    canApply() {
      if (!this.preview || this.busy !== null) return false
      if (this.strategy === 'merge') return this.plan.toAdd.length > 0
      return this.confirmReplace && this.preview.valid.length > 0
    },
    applyLabel() {
      if (this.strategy === 'merge') return this.plan.toAdd.length ? `Mesclar ${this.plan.toAdd.length}` : 'Nada novo para mesclar'
      return `Substituir por ${this.preview.valid.length}`
    }
  },
  methods: {
    say(kind, text) { this.msg = { kind, text } },

    async doPdf() {
      this.busy = 'pdf'
      this.msg = null
      try {
        await this.makePdf()
        this.say('ok', 'PDF gerado e baixado.')
      } catch (err) {
        this.say('err', `Não foi possível gerar o PDF: ${err?.message || err}`)
      } finally {
        this.busy = null
      }
    },

    doExport() {
      this.busy = 'export'
      this.msg = null
      try {
        const data = buildExport(this.companyName, this.entries, this.questions.length)
        const text = JSON.stringify(data, null, 2)
        JSON.parse(text) // garante que o que vai para o arquivo é JSON válido
        const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = exportFileName(this.companyName) + '.json'
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        this.say('ok', `${data.entries.length} avaliação(ões) exportada(s) em ${a.download}.`)
      } catch (err) {
        this.say('err', `Falha ao exportar: ${err?.message || err}`)
      } finally {
        this.busy = null
      }
    },

    openPicker() { this.$refs.file.click() },
    onPick(ev) {
      const f = ev.target.files && ev.target.files[0]
      ev.target.value = ''
      if (f) this.readFile(f)
    },
    onDrop(ev) {
      this.dragOver = false
      const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]
      if (f) this.readFile(f)
    },

    async readFile(file) {
      this.preview = null
      this.confirmReplace = false
      this.strategy = 'merge'
      if (!/\.json$/i.test(file.name)) { this.say('err', 'Selecione um arquivo .json exportado pelo app.'); return }
      if (file.size === 0) { this.say('err', 'O arquivo está vazio.'); return }
      if (file.size > MAX_IMPORT_BYTES) { this.say('err', 'Arquivo grande demais (máx. 2 MB).'); return }
      this.busy = 'read'
      try {
        const r = parseImport(await file.text(), this.questions)
        if (!r.ok) { this.say('err', r.error + ' Nada foi alterado.'); return }
        if (!r.valid.length) {
          this.say('err', `Nenhuma avaliação válida no arquivo (${r.invalid.length} inválidas). Nada foi alterado.`)
          return
        }
        this.preview = { ...r, fileName: file.name }
        this.say('info', 'Confira a prévia e escolha como importar.')
      } catch (err) {
        this.say('err', `Não foi possível ler o arquivo: ${err?.message || err}`)
      } finally {
        this.busy = null
      }
    },

    cancel() {
      this.preview = null
      this.say('info', 'Importação cancelada. Nada foi alterado.')
    },

    apply() {
      if (!this.canApply) return
      this.busy = 'import'
      try {
        const r = applyImport(this.companyName, this.preview.valid, this.strategy)
        this.$emit('imported', r.history)
        const verb = this.strategy === 'replace' ? 'restauradas' : 'adicionadas'
        this.say('ok', `${r.added} avaliação(ões) ${verb}. Histórico com ${r.history.length} registro(s).`)
        this.preview = null
      } catch (err) {
        this.say('err', err?.message || String(err))
      } finally {
        this.busy = null
      }
    }
  }
}
</script>

<style scoped>
.da { display: grid; gap: 12px; }

.da__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.da__group {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 1px solid var(--line);
  padding: 2px 2px 2px 12px;
}

.da__gk {
  font-size: 9.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-lo);
  margin-right: 6px;
}

.da__file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

.da__drop {
  padding: 14px;
  border: 1px dashed var(--line-strong);
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--ink-lo);
  transition: border-color var(--dur) var(--ease), background var(--dur) var(--ease);
}

.da__drop.is-over {
  border-color: var(--ref);
  background: var(--ref-bg);
  color: var(--ink);
}

.da__preview {
  border: 1px solid var(--line-strong);
  background: var(--panel-deep);
  padding: 16px 18px;
  display: grid;
  gap: 12px;
}

.da__ph { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; font-size: 12px; color: var(--ink); }
.da__ph span { font-size: 10px; letter-spacing: 0.08em; color: var(--ink-lo); }

.da__counts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.da__counts li {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-mid);
  border: 1px solid var(--line);
  padding: 4px 9px;
}

.da__counts li b { color: var(--ink); font-size: 12px; margin-right: 3px; }
.da__counts li.is-bad { color: var(--crit); border-color: var(--crit); }

.da__inv { font-size: 11px; color: var(--ink-mid); }
.da__inv summary { cursor: pointer; color: var(--ink-lo); }
.da__inv ul { margin: 8px 0 0; padding-left: 18px; line-height: 1.6; }

.da__strat { border: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.da__strat legend { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-lo); margin-bottom: 6px; }

.da__strat label {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink-mid);
  cursor: pointer;
}

.da__strat b { color: var(--ink); }
.da__confirm { color: var(--crit) !important; }

.da__pa { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }

.da__msg {
  margin: 0;
  min-height: 1.4em;
  font-size: 11px;
  letter-spacing: 0.06em;
}

.da__msg.is-ok { color: var(--safe); }
.da__msg.is-err { color: var(--crit); }
.da__msg.is-info { color: var(--ink-mid); }

.btn:focus-visible,
.da__strat input:focus-visible {
  outline: 2px solid var(--ref);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .da__bar { flex-direction: column; align-items: stretch; }
  .da__group { justify-content: space-between; }
  .da__drop { display: none; }
}
</style>
