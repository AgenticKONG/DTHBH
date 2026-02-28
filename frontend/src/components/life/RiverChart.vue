<template>
  <div class="river-chart-container" ref="container">
    <div class="river-axis-top">
      <span class="era-indicator">時代底色：晚清 ➔ 民國 ➔ 新中國</span>
    </div>
    
    <svg id="river-svg" :width="width" :height="height">
      <defs>
        <filter id="river-ink-spread" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- 1. 時代背景層 (Contextual Layers) -->
      <g class="context-layer">
        <rect v-for="era in contextEvents" :key="era.name"
          :x="timeScale(era.start)"
          :y="0"
          :width="Math.max(2, timeScale(era.end) - timeScale(era.start))"
          :height="height - margin.bottom"
          :fill="era.color"
        />
        <text v-for="era in contextEvents" :key="'label-'+era.name"
          :x="timeScale(era.start) + 5"
          :y="20"
          class="era-text"
        >{{ era.name }}</text>
      </g>

      <!-- 2. 大河堆疊層 (Stacked Area) -->
      <g class="river-layers" filter="url(#river-ink-spread)">
        <path v-for="layer in stackedData" :key="layer.key"
          :d="areaGenerator(layer)"
          :fill="getThemeColor(layer.key)"
          :fill-opacity="selectedThemes.length === 0 || selectedThemes.includes(layer.key) ? 0.7 : 0.1"
          class="river-path"
        />
      </g>

      <!-- 3. 年份交互節點 -->
      <g class="interaction-layer">
        <circle v-for="b in buckets" :key="b.year"
          :cx="timeScale(b.year)"
          :cy="height - margin.bottom - 5"
          :r="b.year === selectedYear ? 6 : 3"
          :fill="b.year === selectedYear ? '#c0392b' : '#8b4513'"
          :fill-opacity="b.year === selectedYear ? 1 : 0.3"
          class="year-anchor"
          @click="$emit('select-year', b.year)"
        />
      </g>

      <!-- 4. 座標軸 -->
      <g class="x-axis" :transform="`translate(0, ${height - margin.bottom})`" ref="xAxis"></g>
    </svg>

    <div class="river-legend">
      <div class="legend-item" v-for="t in themes" :key="t.id" :style="{ opacity: selectedThemes.length && !selectedThemes.includes(t.id) ? 0.4 : 1 }">
        <span class="dot" :style="{ backgroundColor: t.color }"></span>
        {{ t.label }}
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'RiverChart',
  props: {
    buckets: Array,
    selectedThemes: Array,
    selectedYear: Number
  },
  emits: ['select-year'],
  data() {
    return {
      width: 1200,
      height: 300,
      margin: { top: 40, right: 50, bottom: 40, left: 50 },
      contextEvents: [
        { name: "鴉片戰爭", start: 1840, end: 1842, color: "rgba(0,0,0,0.05)" },
        { name: "甲午戰爭", start: 1894, end: 1895, color: "rgba(192,57,43,0.05)" },
        { name: "辛亥革命", start: 1911, end: 1912, color: "rgba(39,174,96,0.05)" },
        { name: "抗日戰爭", start: 1937, end: 1945, color: "rgba(192,57,43,0.08)" },
        { name: "新中國", start: 1949, end: 1955, color: "rgba(192,57,43,0.1)" }
      ],
      themes: CHRONOLOGY_THEMES
    };
  },
  computed: {
    timeScale() {
      return d3.scaleLinear()
        .domain([1864, 1955])
        .range([this.margin.left, this.width - this.margin.right]);
    },
    yScale() {
      // 使用平根縮放，優化早年起伏
      return d3.scaleSqrt()
        .domain([0, d3.max(this.buckets, b => b.totalWeight) * 1.2 || 100])
        .range([this.height - this.margin.bottom, this.margin.top]);
    },
    stackedData() {
      if (!this.buckets.length) return [];
      const stack = d3.stack()
        .keys(this.themes.map(t => t.id))
        .value((d, key) => (d.byTheme[key]?.totalWeight || 0));
      return stack(this.buckets);
    },
    areaGenerator() {
      return d3.area()
        .x(d => this.timeScale(d.data.year))
        .y0(d => this.yScale(d[0]))
        .y1(d => this.yScale(d[1]))
        .curve(d3.curveMonotoneX);
    }
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.renderAxis();
  },
  updated() {
    this.renderAxis();
  },
  methods: {
    handleResize() {
      if (this.$refs.container) {
        this.width = this.$refs.container.clientWidth;
      }
    },
    getThemeColor(id) {
      return this.themes.find(t => t.id === id)?.color || '#999';
    },
    renderAxis() {
      const axis = d3.axisBottom(this.timeScale)
        .ticks(20)
        .tickFormat(d => d + "年");
      d3.select(this.$refs.xAxis).call(axis);
    }
  }
};
</script>

<style scoped>
.river-chart-container {
  width: 100%;
  background: #fdf5e6;
  padding: 20px 0;
  border-bottom: 1px solid #d2b48c;
}

.river-axis-top {
  padding: 0 50px;
  margin-bottom: 10px;
}

.era-indicator {
  font-family: "KaiTi", serif;
  font-size: 14px;
  color: #8b4513;
  opacity: 0.6;
}

.era-text {
  font-size: 10px;
  fill: #8b4513;
  opacity: 0.4;
  writing-mode: vertical-rl;
}

.river-path {
  transition: all 0.5s ease;
  cursor: pointer;
}

.river-path:hover {
  fill-opacity: 0.9;
}

.year-anchor {
  cursor: pointer;
  transition: r 0.3s;
}

.year-anchor:hover {
  r: 8;
}

.river-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
  font-size: 12px;
  color: #5c4033;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.3s;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.x-axis :deep(path), .x-axis :deep(line) {
  stroke: #d2b48c;
}

.x-axis :deep(text) {
  fill: #8b4513;
  font-family: "Georgia", serif;
}
</style>
