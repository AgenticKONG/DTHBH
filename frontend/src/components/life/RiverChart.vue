<template>
  <div class="river-scroll-wrapper" ref="scrollContainer" @wheel.prevent="onWheel">
    <div class="river-chart-inner" :style="{ width: chartWidth + 'px' }">
      <svg :width="chartWidth" :height="320" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
        <defs>
          <filter id="ink-spread-final" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
        </defs>

        <!-- 1. 背景時代區塊 -->
        <g class="era-layer">
          <rect v-for="(era, idx) in eras" :key="era.name"
            :x="timeScale(era.start)"
            y="0"
            :width="timeScale(era.end + (idx < eras.length - 1 ? 1 : 0)) - timeScale(era.start)"
            height="200"
            :fill="era.color"
            fill-opacity="0.05"
          />
          <!-- 標題：稍微下移以避開懸浮工具條，但仍保持浮印感 -->
          <text v-for="era in eras" :key="'lbl-'+era.name"
            :x="timeScale(era.start) + 15"
            y="65"
            class="era-stamp-text"
          >{{ era.name }}</text>
        </g>

        <!-- 2. 生平大河 (再次壓低：繪圖高度限制在 140px 以內) -->
        <g class="river-group" transform="translate(0, 60)" filter="url(#ink-spread-final)">
          <path v-for="layer in stackedData" :key="layer.key"
            :d="areaGenerator(layer)"
            :fill="getThemeColor(layer.key)"
            :fill-opacity="isThemeActive(layer.key) ? 0.7 : 0.08"
            class="river-path"
          />
        </g>

        <!-- 3. 年份中軸 (y=200) -->
        <g class="axis-group" transform="translate(0, 200)">
          <line :x1="margin.left" y1="0" :x2="chartWidth - margin.right" y2="0" stroke="#8b4513" stroke-width="1.2" opacity="0.3" />
          <g v-for="year in years" :key="'y-'+year" :transform="`translate(${timeScale(year)}, 0)`">
            <line v-if="year % 5 === 0" y1="-5" y2="10" stroke="#8b4513" stroke-width="0.8" opacity="0.4" />
            <text v-if="year % 10 === 0" y="24" class="axis-label">{{ year }}</text>
          </g>
        </g>

        <!-- 4. 環境大事 (縱向指示 - y=200-320) -->
        <g class="context-group" transform="translate(0, 200)">
          <g v-for="(ev, idx) in contextEvents" :key="'ctx-'+idx">
            <line 
              :x1="timeScale(ev.start)" 
              y1="0" 
              :x2="timeScale(ev.start)" 
              :y2="30 + (idx % 3) * 20" 
              stroke="#a64d32" 
              stroke-width="1" 
              opacity="0.2" 
            />
            <rect 
              :x="timeScale(ev.start) - 1" 
              :y="25 + (idx % 3) * 25" 
              width="2" 
              height="18" 
              fill="#a64d32" 
              opacity="0.6" 
            />
            <text 
              :x="timeScale(ev.start) + 5" 
              :y="30 + (idx % 3) * 25" 
              class="context-tag-text"
            >{{ ev.name }}</text>
          </g>
        </g>

        <!-- 5. 交互標尺 (垂直全屏標尺線) -->
        <g v-if="hoverYear" class="interactive-ruler" style="pointer-events: none;">
          <line :x1="timeScale(hoverYear)" y1="0" :x2="timeScale(hoverYear)" y2="320" stroke="#c0392b" stroke-width="1" stroke-dasharray="4,2" />
          <circle :cx="timeScale(hoverYear)" cy="200" r="4" fill="#c0392b" />
          
          <foreignObject :x="getTooltipX" y="65" width="280" height="200">
            <div class="ink-tooltip-dh">
              <div class="tp-year-dh">{{ hoverYear }} 年</div>
              <div class="tp-body-dh" v-if="hoverBucket">
                <div v-for="ev in topEvents" :key="ev.id" class="tp-item-dh">
                  <span class="tp-stamp-dh" :style="{ color: getThemeColor(ev.themes[0]) }">{{ ev.location || '游' }}</span>
                  <span class="tp-summary-dh">{{ ev.summary }}</span>
                </div>
              </div>
            </div>
          </foreignObject>
        </g>

        <!-- 6. 點擊層 -->
        <g class="click-layer">
          <rect v-for="year in years" :key="'cl-'+year"
            :x="timeScale(year) - 15" y="0" width="30" height="320"
            fill="transparent" style="cursor: pointer"
            @click="$emit('select-year', year)"
          />
          <circle v-show="selectedYear" :cx="timeScale(selectedYear)" cy="200" r="6" fill="#c0392b" filter="blur(1px)" />
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
  props: { buckets: Array, selectedThemes: Array, selectedYear: Number },
  emits: ['select-year'],
  data() {
    return {
      chartWidth: 3200,
      margin: { top: 40, right: 100, bottom: 40, left: 100 },
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
    timeScale() {
      return d3.scaleLinear().domain([1864, 1955]).range([this.margin.left, this.chartWidth - this.margin.right]);
    },
    yScale() {
      // 大河高度限制在 140px，緩衝 2.5 倍
      const maxW = d3.max(this.buckets, b => b.totalWeight) || 100;
      return d3.scaleSqrt().domain([0, maxW * 2.5]).range([140, 0]);
    },
    stackedData() {
      if (!this.buckets.length) return [];
      const stack = d3.stack().keys(this.themes.map(t => t.id)).value((d, key) => d.byTheme[key]?.totalWeight || 0);
      return stack(this.buckets);
    },
    areaGenerator() {
      return d3.area().x(d => this.timeScale(d.data.year)).y0(d => this.yScale(d[0])).y1(d => this.yScale(d[1])).curve(d3.curveMonotoneX);
    },
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
      const res = await fetch('/data/context_events.json');
      this.contextEvents = await res.json();
    } catch (e) { console.error(e); }
    if (this.selectedYear) this.scrollToYear(this.selectedYear);
  },
  methods: {
    getThemeColor(id) { return this.themes.find(t => t.id === id)?.color || '#999'; },
    isThemeActive(id) { return !this.selectedThemes.length || this.selectedThemes.includes(id); },
    onMouseMove(e) {
      const container = this.$refs.scrollContainer;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) + container.scrollLeft;
      const year = Math.round(this.timeScale.invert(x));
      if (year >= 1864 && year <= 1955) this.hoverYear = year;
    },
    onMouseLeave() { this.hoverYear = null; },
    onWheel(e) { if (this.$refs.scrollContainer) this.$refs.scrollContainer.scrollLeft += e.deltaY; },
    scrollToYear(year) {
      if (this.$refs.scrollContainer) {
        const x = this.timeScale(year) - window.innerWidth / 2;
        this.$refs.scrollContainer.scrollTo({ left: x, behavior: 'smooth' });
      }
    }
  },
  watch: { selectedYear(newY) { if (newY) this.scrollToYear(newY); } }
};
</script>

<style scoped>
.river-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  background: #fdf5e6;
  scrollbar-width: thin;
  scrollbar-color: #d2b48c transparent;
}

.era-stamp-text {
  font-family: "Ma Shan Zheng", "KaiTi", cursive, serif;
  font-size: 16px;
  fill: #8b4513;
  opacity: 0.15;
  writing-mode: vertical-rl;
  letter-spacing: 4px;
}

.axis-label {
  font-family: "Georgia", serif;
  font-size: 11px;
  fill: #8b4513;
  text-anchor: middle;
}

.context-tag-text {
  font-family: "KaiTi", serif;
  font-size: 11px;
  fill: #a64d32;
  opacity: 0.8;
}

.ink-tooltip-dh {
  background: rgba(253, 245, 230, 0.98);
  border: 1.5px solid #d2b48c;
  padding: 12px;
  box-shadow: 6px 6px 20px rgba(0,0,0,0.15);
  font-family: "KaiTi", serif;
  border-radius: 4px;
}

.tp-year-dh {
  border-bottom: 2px solid #c0392b;
  color: #c0392b;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  padding-bottom: 4px;
}

.tp-item-dh { display: flex; gap: 10px; margin-bottom: 8px; }

.tp-stamp-dh {
  font-size: 9px;
  border: 1px solid currentColor;
  padding: 2px;
  writing-mode: vertical-rl;
  border-radius: 2px;
}

.tp-summary-dh {
  font-size: 13.5px;
  line-height: 1.4;
  color: #3d2b1f;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.river-path { transition: fill-opacity 0.4s; }
.river-scroll-wrapper::-webkit-scrollbar { height: 6px; }
.river-scroll-wrapper::-webkit-scrollbar-thumb { background: #d2b48c; border-radius: 3px; }
</style>
