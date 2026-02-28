<template>
  <div class="river-scroll-wrapper" ref="scrollContainer" @wheel.prevent="onWheel">
    <div class="river-chart-inner" :style="{ width: chartWidth + 'px' }">
      <svg :width="chartWidth" :height="height" @mousemove="onMouseMove" @mouseleave="hoverYear = null">
        <defs>
          <filter id="ink-spread-heavy" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
        </defs>

        <!-- 1. 上部：生平大河 (Life River - 70% Height) -->
        <g class="life-river-group" :transform="`translate(0, ${margin.top})`" filter="url(#ink-spread-heavy)">
          <path v-for="layer in stackedData" :key="layer.key"
            :d="areaGenerator(layer)"
            :fill="getThemeColor(layer.key)"
            :fill-opacity="isThemeActive(layer.key) ? 0.8 : 0.15"
            class="river-path"
          />
        </g>

        <!-- 2. 中部：年份主軸 (Central Year Axis) -->
        <g class="central-axis-group" :transform="`translate(0, ${riverBottom})`">
          <line :x1="margin.left" :y1="0" :x2="chartWidth - margin.right" :y2="0" stroke="#8b4513" stroke-width="1" opacity="0.4" />
          <!-- 年份刻度 -->
          <g v-for="year in years" :key="'tick-'+year" :transform="`translate(${timeScale(year)}, 0)`">
            <line v-if="year % 5 === 0" y1="-5" y2="5" stroke="#8b4513" stroke-width="1" opacity="0.6" />
            <text v-if="year % 10 === 0" y="20" class="axis-year-text">{{ year }}</text>
          </g>
        </g>

        <!-- 3. 下部：環境大事 (Context Stream - 30% Height) -->
        <g class="context-stream-group" :transform="`translate(0, ${riverBottom + 30})`">
          <g v-for="(era, idx) in contextEvents" :key="era.name" class="context-item">
            <rect
              :x="timeScale(era.start)"
              :y="getLaneY(idx)"
              :width="Math.max(4, timeScale(era.end) - timeScale(era.start))"
              :height="12"
              :fill="era.color"
              rx="2"
              class="context-rect"
            />
            <text
              :x="timeScale(era.start)"
              :y="getLaneY(idx) - 4"
              class="context-label"
            >{{ era.name }}</text>
          </g>
        </g>

        <!-- 4. 交互：時間垂線 (Time Ruler) -->
        <g v-if="hoverYear" class="time-ruler">
          <line
            :x1="timeScale(hoverYear)"
            :y1="0"
            :x2="timeScale(hoverYear)"
            :y2="height"
            stroke="#c0392b"
            stroke-width="1"
            stroke-dasharray="4,2"
          />
          <rect
            :x="timeScale(hoverYear) - 25"
            :y="riverBottom - 10"
            width="50"
            height="20"
            rx="10"
            fill="#c0392b"
          />
          <text
            :x="timeScale(hoverYear)"
            :y="riverBottom + 4"
            text-anchor="middle"
            fill="white"
            class="ruler-text"
          >{{ hoverYear }}</text>
        </g>

        <!-- 5. 點擊錨點 -->
        <g class="click-anchors">
          <circle v-for="b in buckets" :key="'anchor-'+b.year"
            :cx="timeScale(b.year)"
            :cy="riverBottom"
            :r="b.year === selectedYear ? 5 : 2"
            :fill="b.year === selectedYear ? '#c0392b' : '#8b4513'"
            style="cursor: pointer"
            @click="$emit('select-year', b.year)"
          />
        </g>
      </svg>
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
      chartWidth: 3200, // 長卷寬度
      height: 450,      // 增加高度以容納雙軸
      margin: { top: 40, right: 100, bottom: 60, left: 100 },
      hoverYear: null,
      contextEvents: [],
      themes: CHRONOLOGY_THEMES
    };
  },
  computed: {
    riverBottom() {
      return this.height * 0.65; // 大河佔比 65%
    },
    years() {
      return d3.range(1864, 1956);
    },
    timeScale() {
      return d3.scaleLinear()
        .domain([1864, 1955])
        .range([this.margin.left, this.chartWidth - this.margin.right]);
    },
    yScale() {
      // 僅限於上半部
      return d3.scaleSqrt()
        .domain([0, d3.max(this.buckets, b => b.totalWeight) * 1.1 || 100])
        .range([this.riverBottom - this.margin.top, 0]);
    },
    stackedData() {
      if (!this.buckets.length) return [];
      const stack = d3.stack()
        .keys(this.themes.map(t => t.id))
        .value((d, key) => (d.byTheme[key]?.totalWeight || 0))
        .offset(d3.stackOffsetNone);
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
  async mounted() {
    try {
      const res = await fetch('/data/context_events.json');
      this.contextEvents = await res.json();
    } catch (e) {
      console.error('Failed to load context events', e);
    }
    this.scrollToYear(this.selectedYear || 1864);
  },
  methods: {
    getThemeColor(id) {
      return this.themes.find(t => t.id === id)?.color || '#999';
    },
    isThemeActive(id) {
      return this.selectedThemes.length === 0 || this.selectedThemes.includes(id);
    },
    getLaneY(idx) {
      return (idx % 3) * 25; // 簡單的泳道分配
    },
    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const year = Math.round(this.timeScale.invert(x));
      if (year >= 1864 && year <= 1955) {
        this.hoverYear = year;
      }
    },
    onWheel(e) {
      // 橫向滾輪支持
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.scrollLeft += e.deltaY;
      }
    },
    scrollToYear(year) {
      if (this.$refs.scrollContainer) {
        const x = this.timeScale(year) - window.innerWidth / 2;
        this.$refs.scrollContainer.scrollTo({ left: x, behavior: 'smooth' });
      }
    }
  },
  watch: {
    selectedYear(newYear) {
      if (newYear) this.scrollToYear(newYear);
    }
  }
};
</script>

<style scoped>
.river-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #fdf5e6;
  border-bottom: 1px solid #d2b48c;
  scrollbar-width: thin;
  scrollbar-color: #8b4513 #fdf5e6;
}

.river-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.river-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #d2b48c;
  border-radius: 3px;
}

.river-chart-inner {
  position: relative;
  cursor: crosshair;
}

.axis-year-text {
  font-family: "Georgia", serif;
  font-size: 11px;
  fill: #8b4513;
  text-anchor: middle;
}

.river-path {
  transition: fill-opacity 0.4s ease;
}

.context-rect {
  opacity: 0.6;
  transition: opacity 0.3s;
}

.context-rect:hover {
  opacity: 1;
}

.context-label {
  font-family: "KaiTi", serif;
  font-size: 10px;
  fill: #5c4033;
}

.ruler-text {
  font-size: 12px;
  font-weight: bold;
}

.time-ruler {
  pointer-events: none;
}
</style>
