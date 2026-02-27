<template>
  <div class="river-chart" ref="container">
    <svg v-if="points.length" :width="width" :height="height">
      <defs>
        <linearGradient id="river-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8e682f" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#8e682f" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- 面积填充 -->
      <path
        :d="areaPath"
        fill="url(#river-grad)"
        stroke="none"
      />

      <!-- 上边界线 -->
      <path
        :d="linePath"
        fill="none"
        stroke="#5a3f21"
        stroke-width="2"
      />

      <!-- 年份节点 -->
      <g v-for="p in points" :key="p.year">
        <circle
          :cx="p.x"
          :cy="p.y"
          r="4"
          :fill="p.year === selectedYear ? '#c0392b' : '#fff'"
          :stroke="p.year === selectedYear ? '#c0392b' : '#8e682f'"
          stroke-width="1.5"
          class="year-dot"
          @mouseenter="hoverYear(p.year)"
          @mouseleave="hoverYear(null)"
          @click="selectYear(p.year)"
        />
      </g>
    </svg>

    <!-- hover 提示 -->
    <div v-if="hoverInfo" class="tooltip" :style="{ left: hoverInfo.left + 'px', top: hoverInfo.top + 'px' }">
      <div class="tooltip-year">{{ hoverInfo.year }} 年</div>
      <div class="tooltip-line">事件数：{{ hoverInfo.count }}</div>
      <div class="tooltip-line">权重：{{ hoverInfo.weight }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RiverChart',
  props: {
    buckets: {
      type: Array,
      required: true
    },
    selectedThemes: {
      type: Array,
      default: () => []
    },
    selectedYear: {
      type: Number,
      default: null
    }
  },
  emits: ['select-year'],
  data() {
    return {
      width: 0,
      height: 180,
      points: [],
      hoverInfo: null
    };
  },
  computed: {
    linePath() {
      if (!this.points.length) return '';
      return this.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    },
    areaPath() {
      if (!this.points.length) return '';
      const top = this.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      const last = this.points[this.points.length - 1];
      const first = this.points[0];
      const bottom = `L ${last.x} ${this.height - 10} L ${first.x} ${this.height - 10} Z`;
      return `${top} ${bottom}`;
    }
  },
  watch: {
    buckets: {
      handler() {
        this.recompute();
      },
      deep: true,
      immediate: true
    },
    selectedThemes() {
      this.recompute();
    }
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    resize() {
      const el = this.$refs.container;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      this.width = rect.width || 800;
      this.recompute();
    },
    visibleWeight(bucket) {
      if (!this.selectedThemes.length) return bucket.totalWeight || 0;
      let sum = 0;
      this.selectedThemes.forEach((id) => {
        const t = bucket.byTheme[id];
        if (t) sum += t.totalWeight || 0;
      });
      return sum || 0;
    },
    recompute() {
      if (!this.width || !this.buckets.length) {
        this.points = [];
        return;
      }
      const paddingX = 32;
      const innerW = this.width - paddingX * 2;
      const years = this.buckets.map((b) => b.year);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      const span = maxYear - minYear || 1;

      const weights = this.buckets.map((b) => this.visibleWeight(b));
      const maxWeight = Math.max(...weights, 1);

      this.points = this.buckets.map((b) => {
        const ratioX = (b.year - minYear) / span;
        const w = this.visibleWeight(b);
        const norm = Math.log(1 + w) / Math.log(1 + maxWeight);
        const x = paddingX + ratioX * innerW;
        const y = this.height - 10 - norm * (this.height - 40);
        return { year: b.year, x, y };
      });
    },
    hoverYear(year) {
      if (!year) {
        this.hoverInfo = null;
        return;
      }
      const bucket = this.buckets.find((b) => b.year === year);
      const pt = this.points.find((p) => p.year === year);
      if (!bucket || !pt) return;
      const weight = this.visibleWeight(bucket);
      const rect = this.$refs.container.getBoundingClientRect();
      this.hoverInfo = {
        year,
        count: bucket.events.length,
        weight,
        left: pt.x - rect.left,
        top: pt.y - rect.top - 50
      };
    },
    selectYear(year) {
      this.$emit('select-year', year);
    }
  }
};
</script>

<style scoped>
.river-chart {
  position: relative;
  width: 100%;
  height: 200px;
}

svg {
  display: block;
}

.year-dot {
  cursor: pointer;
}

.tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #4a3a1f;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
  pointer-events: none;
  white-space: nowrap;
}

.tooltip-year {
  font-weight: 600;
  margin-bottom: 2px;
}

.tooltip-line {
  opacity: 0.8;
}
</style>

