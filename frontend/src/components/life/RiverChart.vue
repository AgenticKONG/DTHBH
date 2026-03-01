<template>
  <div class="river-render-container" ref="containerRef">
    <!-- SVG 畫布：寬度固定 3200px，高度跟隨父容器動態變化 (100%) -->
    <svg :width="chartWidth" height="100%" class="river-svg-stable" 
         @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      
      <!-- 定義全局水墨濾鏡 -->
      <defs>
        <filter id="ink-filter-dh-stable" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>

      <!-- 1. 時代背景層 (ERA Background)：縱向覆蓋 0% - 100% -->
      <g class="era-layer">
        <rect v-for="(era, idx) in eras" :key="era.name"
          :x="timeScale(era.start)" y="0"
          :width="timeScale(era.end + 1) - timeScale(era.start) + 2" 
          :height="containerHeight"
          :fill="era.color" 
          fill-opacity="0.04"
        />
        <!-- 時代標題：水印質感融入頂部天空 (6% 高度處) -->
        <text v-for="era in eras" :key="'lbl-'+era.name"
          :x="timeScale(era.start) + 20" 
          :y="containerHeight * 0.08"
          class="era-title-text"
        >{{ era.name }}</text>
      </g>

      <!-- 2. 生平大河主體 (River Path)：D3 面積圖，繪圖區鎖定在 [20%, 75%] -->
      <g class="river-content" filter="url(#ink-filter-dh-stable)">
        <path v-for="layer in stackedData" :key="layer.key"
          :d="areaGenerator(layer)"
          :fill="getThemeColor(layer.key)"
          :fill-opacity="isThemeActive(layer.key) ? 0.75 : 0.08"
          class="river-path"
        />
      </g>

      <!-- 3. 年份主軸 (Horizontal Axis)：視覺「地平線」，固定在 75% 高度 -->
      <g class="axis-group" :transform="`translate(0, ${containerHeight * 0.75})`">
        <line x1="0" y1="0" :x2="chartWidth" y2="0" stroke="#3d2b1f" stroke-width="1.5" opacity="0.25" />
        <g v-for="year in years" :key="'y-'+year" :transform="`translate(${timeScale(year)}, 0)`">
          <line v-if="year % 5 === 0" y1="-5" y2="8" stroke="#3d2b1f" stroke-width="0.8" opacity="0.3" />
          <text v-if="year % 10 === 0" y="24" class="axis-label-ya">{{ year }}</text>
        </g>
      </g>

      <!-- 4. 環境大事條 (Context Events)：垂直對齊，從地平線向水下延伸 -->
      <g class="context-group" :transform="`translate(0, ${containerHeight * 0.75})`">
        <g v-for="(ev, idx) in contextEvents" :key="'ctx-'+idx">
          <line :x1="timeScale(ev.start)" y1="0" 
                :x2="timeScale(ev.start)" 
                :y2="containerHeight * 0.06 + (idx % 3) * (containerHeight * 0.05)" 
                stroke="#a64d32" stroke-width="0.8" opacity="0.15" />
          <rect :x="timeScale(ev.start) - 1" 
                :y="containerHeight * 0.04 + (idx % 3) * (containerHeight * 0.05)" 
                width="2" :height="14" fill="#a64d32" opacity="0.5" />
          <text :x="timeScale(ev.start) + 6" 
                :y="containerHeight * 0.07 + (idx % 3) * (containerHeight * 0.05)" 
                class="context-tag-text">{{ ev.name }}</text>
        </g>
      </g>

      <!-- 5. 交互標尺 (Interactive Ruler)：跟隨鼠標的全屏標尺線 -->
      <g v-if="hoverYear" class="time-ruler" style="pointer-events: none;">
        <line :x1="timeScale(hoverYear)" y1="0" 
              :x2="timeScale(hoverYear)" :y2="containerHeight" 
              stroke="#c0392b" stroke-width="1" stroke-dasharray="5,3" />
        <circle :cx="timeScale(hoverYear)" :cy="containerHeight * 0.75" r="4" fill="#c0392b" />
        
        <!-- 數據提示浮窗 (Hover Peek) -->
        <foreignObject :x="getTooltipX" :y="containerHeight * 0.20" width="280" height="220">
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

      <!-- 6. 交互點擊層 (Event Listener Layer)：鋪滿整個寬度，捕捉點擊事件 -->
      <g class="interaction-layer">
        <rect v-for="year in years" :key="'cl-'+year"
          :x="timeScale(year) - 15" y="0" width="30" 
          :height="containerHeight"
          fill="transparent" style="cursor: pointer"
          @click="$emit('select-year', year)"
        />
        <!-- 當前選中年份的高亮球 -->
        <circle v-show="selectedYear" 
                :cx="timeScale(selectedYear)" 
                :cy="containerHeight * 0.75" 
                r="7" fill="#c0392b" filter="blur(1px)" />
      </g>
    </svg>
  </div>
</template>

<script>
/**
 * RiverChart - D3 渲染組件
 * 核心邏輯：建立「時間 -> 像素」及「權重 -> 高度」的映射矩陣。
 */
import * as d3 from 'd3';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'RiverChart',
  props: { 
    buckets: Array,        // 輸入內存：按年份聚合的原始數據桶
    selectedThemes: Array, // 狀態輸入：過濾器掩碼
    selectedYear: Number   // 狀態輸入：選中指針
  },
  emits: ['select-year'],
  data() {
    return {
      chartWidth: 3200,      // 硬邊界：長卷寬度
      hoverYear: null,       // 當前懸停年份
      contextEvents: [],     // 外部環境事件數據
      themes: CHRONOLOGY_THEMES,
      containerHeight: 500,  // 初始化容器高度預設值
      eras: [
        { name: "晚清時期", start: 1864, end: 1911, color: "#8b4513" },
        { name: "民國時期", start: 1912, end: 1948, color: "#2c3e50" },
        { name: "新中國時期", start: 1949, end: 1955, color: "#c0392b" }
      ]
    };
  },
  computed: {
    years() { return d3.range(1864, 1956); },
    
    /**
     * X 軸線性映射矩陣 (Linear Scale)
     * 將年份映射到畫布寬度 [60, 3120] 像素區間
     */
    timeScale() { 
      return d3.scaleLinear()
        .domain([1864, 1955])
        .range([60, this.chartWidth - 80]); 
    },
    
    /**
     * Y 軸平方根映射矩陣 (Sqrt Scale)
     * 將社會權重映射到垂直高度比例。使用平方根是為了壓縮極端高頻數據，保持曲線平緩。
     */
    yScale() {
      const maxW = d3.max(this.buckets, b => b.totalWeight) || 100;
      const h = this.containerHeight;
      // 起始點 (地平線): 75% -> 結束點 (天花板): 20%
      return d3.scaleSqrt().domain([0, maxW * 2.5]).range([h * 0.75, h * 0.20]);
    },
    
    /**
     * D3 堆疊數據生成器
     * 將 Buckets 轉化為一組路徑數據點矩陣
     */
    stackedData() {
      if (!this.buckets.length) return [];
      return d3.stack()
        .keys(this.themes.map(t => t.id))
        .value((d, key) => d.byTheme[key]?.totalWeight || 0)(this.buckets);
    },
    
    /**
     * D3 面積路徑生成器
     * 將數據矩陣轉化為 SVG <path> 的 d 屬性字符串 (Bezier Curves)
     */
    areaGenerator() { 
      return d3.area()
        .x(d => this.timeScale(d.data.year))
        .y0(d => this.yScale(d[0]))
        .y1(d => this.yScale(d[1]))
        .curve(d3.curveMonotoneX); 
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
  mounted() {
    /**
     * 動態高度適配邏輯
     * 監聽容器尺寸變化，實時更新 containerHeight，觸發重新計算 yScale 映射
     */
    this.updateHeight();
    window.addEventListener('resize', this.updateHeight);
    this.fetchContext();
  },
  unmounted() {
    window.removeEventListener('resize', this.updateHeight);
  },
  methods: {
    updateHeight() {
      if (this.$refs.containerRef) {
        this.containerHeight = this.$refs.containerRef.clientHeight;
      }
    },
    async fetchContext() {
      try {
        const res = await fetch('/data/context_events.json');
        this.contextEvents = await res.json();
      } catch (e) { console.error('背景數據加載異常:', e); }
    },
    getThemeColor(id) { return this.themes.find(t => t.id === id)?.color || '#999'; },
    isThemeActive(id) { return !this.selectedThemes.length || this.selectedThemes.includes(id); },
    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // 使用 timeScale.invert 將物理像素座標 反向映射回 年份數據
      const year = Math.round(this.timeScale.invert(x));
      if (year >= 1864 && year <= 1955) this.hoverYear = year;
    },
    onMouseLeave() { this.hoverYear = null; }
  }
};
</script>

<style scoped>
.river-render-container {
  width: 100%;
  height: 100%;
  background-color: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
}

.river-svg-stable { display: block; }

.era-title-text {
  font-family: "Ma Shan Zheng", "KaiTi", cursive, serif;
  font-size: 18px; fill: #3d2b1f; opacity: 0.12; writing-mode: vertical-rl; letter-spacing: 5px;
}

.axis-label-ya {
  font-family: "Georgia", serif; font-size: 11px; fill: #3d2b1f; opacity: 0.6; text-anchor: middle;
}

.context-tag-text {
  font-family: "KaiTi", serif; font-size: 10px; fill: #a64d32; opacity: 0.7; pointer-events: none;
}

.ink-tooltip-stable {
  background: rgba(253, 245, 230, 0.98); border: 1.5px solid #d2b48c; padding: 12px;
  box-shadow: 6px 6px 20px rgba(0,0,0,0.12); font-family: "KaiTi", serif; border-radius: 4px;
}

.tp-year { border-bottom: 2px solid #c0392b; color: #c0392b; font-weight: bold; font-size: 16px; margin-bottom: 10px; padding-bottom: 4px; }
.tp-item { display: flex; gap: 10px; margin-bottom: 8px; align-items: flex-start; }
.tp-stamp { font-size: 9px; border: 1px solid currentColor; padding: 2px; writing-mode: vertical-rl; border-radius: 2px; }
.tp-txt { font-size: 13.5px; line-height: 1.45; color: #3d2b1f; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.river-path { transition: fill-opacity 0.4s; cursor: pointer; }
</style>
