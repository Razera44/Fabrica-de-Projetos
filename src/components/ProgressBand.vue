<template>
  <div class="band">
    <div class="band__inner container">
      <div class="readout band__readout">
        <span class="readout__k">Módulo</span>
        <span class="readout__dots"></span>
        <span class="readout__v">{{ theme }}</span>
      </div>

      <div class="readout band__readout band__readout--num">
        <span class="readout__k">Item</span>
        <span class="readout__dots"></span>
        <span class="readout__v">
          <b>{{ String(current).padStart(2, '0') }}</b><i>/</i>{{ String(total).padStart(2, '0') }}
          <em>{{ String(percent).padStart(2, '0') }}%</em>
        </span>
      </div>
    </div>

    <!-- barra segmentada: cada traço é um item do questionário -->
    <div class="band__track" aria-hidden="true">
      <span
        v-for="n in total"
        :key="n"
        class="band__cell"
        :class="{ 'is-done': n < current, 'is-now': n === current }"
      ></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBand',
  props: {
    theme: {
      type: String,
      required: true
    },
    current: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  computed: {
    percent() {
      return Math.round((this.current / this.total) * 100)
    }
  }
}
</script>

<style scoped>
/*
  Sem backdrop-filter: desfocar o fundo atrás de uma barra fixa obriga o
  navegador a refazer a composição a cada quadro e é uma das fontes de
  tremida durante as transições. Um fundo sólido resolve visualmente igual.
*/
.band {
  position: sticky;
  top: 0;
  z-index: 5;
  background: linear-gradient(180deg, var(--bg) 55%, rgba(8, 9, 10, 0.88));
}

.band__inner {
  display: flex;
  gap: 26px;
  padding-top: 11px;
  padding-bottom: 9px;
}

.band__readout {
  flex: 1;
  min-width: 0;
}

.band__readout--num {
  flex: 0 1 210px;
}

.band__readout--num b {
  font-weight: 600;
  color: var(--accent);
}

.band__readout--num i {
  font-style: normal;
  color: var(--ink-faint);
  margin: 0 1px;
}

.band__readout--num em {
  font-style: normal;
  color: var(--ink-lo);
  margin-left: 8px;
}

/* trilho segmentado */
.band__track {
  display: flex;
  gap: 2px;
  height: 4px;
  padding: 0 var(--gutter) 0;
  max-width: var(--container);
  margin: 0 auto 6px;
}

.band__cell {
  flex: 1;
  background: var(--line-soft);
  transition: background var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}

.band__cell.is-done {
  background: var(--line-strong);
}

.band__cell.is-now {
  background: var(--accent);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.55);
}

@media (max-width: 520px) {
  .band__inner {
    gap: 14px;
  }

  .band__readout--num {
    flex: 0 1 150px;
  }

  .band__readout--num em {
    display: none;
  }
}
</style>
