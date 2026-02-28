<template>
  <div class="river-render-container">
    <svg :width="chartWidth" height="500" class="river-svg-stable" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <defs>
        <filter id="ink-filter-dh-stable" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>

      <!-- 1. 背景 -->
      <g class="era-layer">
        <rect v-for="(era, idx) in eras" :key="era.name"
          :x="timeScale(era.start)" y="0"
          :width="timeScale(era.end + 1) - timeScale(era.start)" height="500"
          :fill="era.color" fill-opacity="0.04"
        />
        <text v-for="era in eras" :key="'lbl-'+era.name"
          :x="timeScale(era.start) + 20" y="50"
          class="era-title-text"
        >{{ era.name }}</text>
      </g>

      <!-- 2. 生平大河 (下移至 y=150-350，留出頂部天空) -->
      <g class="river-content" transform="translate(0, 150)" filter="url(#ink-filter-dh-stable)">
        <path v-for="layer in stackedData" :key="layer.key"
          :d="areaGenerator(layer)"
          :fill="getThemeColor(layer.key)"
          :fill-opacity="isThemeActive(layer.key) ? 0.75 : 0.08"
          class="river-path"
        />
      </g>

      <!-- 3. 年份主軸 (固定 y=350) -->
      <g class="axis-group" transform="translate(0, 350)">
        <!-- 使用知音長卷標準墨色 #3d2b1f，低透明度 -->
        <line x1="0" y1="0" :x2="chartWidth" y2="0" stroke="#3d2b1f" stroke-width="1" opacity="0.15" />
        <g v-for="year in years" :key="'y-'+year" :transform="`translate(${timeScale(year)}, 0)`">
          <line v-if="year % 5 === 0" y1="-4" y2="6" stroke="#3d2b1f" stroke-width="0.6" opacity="0.2" />
          <text v-if="year % 10 === 0" y="24" class="axis-label-ya">{{ year }}</text>
        </g>
      </g>

      <!-- 4. 環境大事 (y=350 往下) -->
      <g class="context-group" transform="translate(0, 350)">
        <g v-for="(ev, idx) in contextEvents" :key="'ctx-'+idx">
          <line :x1="timeScale(ev.start)" y1="0" :x2="timeScale(ev.start)" :y2="40 + (idx % 3) * 25" stroke="#a64d32" stroke-width="1" opacity="0.15" />
          <rect :x="timeScale(ev.start) - 1" :y="30 + (idx % 3) * 25" width="2" height="20" fill="#a64d32" opacity="0.6" />
          <text :x="timeScale(ev.start) + 6" :y="45 + (idx % 3) * 25" class="context-tag-text">{{ ev.name }}</text>
        </g>
      </g>

      <!-- 5. 交互標尺 (全高) -->
      <g v-if="hoverYear" class="time-ruler" style="pointer-events: none;">
        <line :x1="timeScale(hoverYear)" y1="0" :x2="timeScale(hoverYear)" y2="500" stroke="#c0392b" stroke-width="1" stroke-dasharray="5,3" />
        <circle :cx="timeScale(hoverYear)" cy="350" r="4" fill="#c0392b" />
        <foreignObject :x="getTooltipX" y="150" width="280" height="220">
          <div class="ink-tooltip-stable">
            <div class="tp-year">{{ hoverYear }} 年</div>
            <div class="tp-body" v-if="hoverBucket">
              <div v-for="ev in topEvents" :key="ev.id" class="tp-item">
                <span class="tp-stamp" :style="{ color: getThemeColor(ev.themes[0]) }">{{ ev.location || '游' }}</span>
                <span class="tp-txt">{{ ev.summary }}</span>
              </div>
            </div>
          </div>
        </foreignObject>
      </g>

      <!-- 6. 點擊層 -->
      <g class="interaction-layer">
        <rect v-for="year in years" :key="'cl-'+year"
          :x="timeScale(year) - 15" y="0" width="30" height="500"
          fill="transparent" style="cursor: pointer"
          @click="$emit('select-year', year)"
        />
        <circle v-show="selectedYear" :cx="timeScale(selectedYear)" cy="350" r="7" fill="#c0392b" filter="blur(1px)" />
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'RiverChart',
  props: { buckets: Array, selectedThemes: Array, selectedYear: Number },
  emits: ['select-year'],
  data() {
    return {
      chartWidth: 3200,
      hoverYear: null,
      contextEvents: [],
      themes: CHRONOLOGY_THEMES,
      eras: [
        { name: "晚清時期", start: 1864, end: 1911, color: "#8b4513" },
        { name: "民國時期", start: 1912, end: 1948, color: "#2c3e50" },
        { name: "新中國時期", start: 1949, end: 1955, color: "#c0392b" }
      ]
    };
  },
  computed: {
    years() { return d3.range(1864, 1956); },
    timeScale() { return d3.scaleLinear().domain([1864, 1955]).range([60, this.chartWidth - 80]); },
    yScale() {
      // 繪圖高度 200px (350 - 150)，緩衝 2.5 倍
      const maxW = d3.max(this.buckets, b => b.totalWeight) || 100;
      return d3.scaleSqrt().domain([0, maxW * 2.5]).range([200, 0]);
    },
    stackedData() {
      if (!this.buckets.length) return [];
      return d3.stack().keys(this.themes.map(t => t.id)).value((d, key) => d.byTheme[key]?.totalWeight || 0)(this.buckets);
    },
    areaGenerator() { return d3.area().x(d => this.timeScale(d.data.year)).y0(d => this.yScale(d[0])).y1(d => this.yScale(d[1])).curve(d3.curveMonotoneX); },
    hoverBucket() { return this.buckets.find(b => b.year === this.hoverYear); },
    topEvents() {
      if (!this.hoverBucket) return [];
      return [...this.hoverBucket.events].sort((a, b) => b.socialWeight - a.socialWeight).slice(0, 3);
    },
    getTooltipX() {
      const x = this.timeScale(this.hoverYear);
      return x + 300 > this.chartWidth ? x - 290 : x + 20;
    }
  },
  async mounted() {
    try {
      // 恢復單一數據源，確保生產環境穩定性
      const res = await fetch('/data/context_events.json');
      this.contextEvents = await res.json();
    } catch (e) { console.error(e); }
    if (this.selectedYear) this.scrollToYear(this.selectedYear);
  },
  methods: {
    getThemeColor(id) { return this.themes.find(t => t.id === id)?.color || '#999'; },
    isThemeActive(id) { return !this.selectedThemes.length || this.selectedThemes.includes(id); },
    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const year = Math.round(this.timeScale.invert(x));
      if (year >= 1864 && year <= 1955) this.hoverYear = year;
    },
    onMouseLeave() { this.hoverYear = null; },
    scrollToYear(year) {
      // 外部父組件處理滾動，這裡僅發送偏移信號或保持內部狀態
    }
  }
};
</script>

<style scoped>
.river-render-container {
  width: 100%;
  height: 500px;
  background-color: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
}

.era-title-text {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 18px;
  fill: #3d2b1f; /* 墨色 */
  opacity: 0.12;
  writing-mode: vertical-rl;
  letter-spacing: 5px;
}

.axis-label-ya {
  font-family: "Georgia", serif;
  font-size: 11px;
  fill: #3d2b1f; /* 墨色 */
  opacity: 0.6;
  text-anchor: middle;
}

.context-tag-text { font-family: "KaiTi", serif; font-size: 11px; fill: #a64d32; opacity: 0.7; pointer-events: none; }
.ink-tooltip-stable { background: rgba(253, 245, 230, 0.98); border: 1.5px solid #d2b48c; padding: 10px; box-shadow: 6px 6px 20px rgba(0,0,0,0.12); font-family: "KaiTi", serif; border-radius: 4px; }
.tp-year { border-bottom: 2px solid #c0392b; color: #c0392b; font-weight: bold; font-size: 16px; margin-bottom: 8px; padding-bottom: 4px; }
.tp-item { display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
.tp-stamp { font-size: 9px; border: 1px solid currentColor; padding: 2px; writing-mode: vertical-rl; border-radius: 2px; }
.tp-txt { font-size: 13.5px; line-height: 1.45; color: #3d2b1f; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.river-path { transition: fill-opacity 0.4s; cursor: pointer; }
</style>
