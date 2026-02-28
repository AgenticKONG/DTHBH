<!--
  RiverChart.vue - 生平大河可视化组件
  
  核心可视化设计 (从上到下的分层):
  ┌────────────────────────────────────────────────────────────┐
  │  0%                                                      │
  │  ┌────────────────────────────────────────────────────┐  │
  │  │ 时期背景层 (era-layer)                              │  │
  │  │ 晚清(1864-1911) | 民国(1912-1948) | 新中国(1949-1955)│  │
  │  └────────────────────────────────────────────────────┘  │
  │  2%                                                      │
  │  ┌────────────────────────────────────────────────────┐  │
  │  │  生平大河 (river-content)                          │  │
  │  │  D3.js 堆叠面积图                                  │  │
  │  │  每个主题一层，按 socialWeight 堆叠                 │  │
  │  │  高度从 0 到 68%                                   │  │
  │  │                                                     │  │
  │  └────────────────────────────────────────────────────┘  │
  │  68% ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  年份轴 (axis-group)
  │  70% ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  环境事件条 (context-group)
  │ 100%                                                      │
  └────────────────────────────────────────────────────────────┘
  
  关键比例 (控制布局):
  - containerHeight * 0.68: 年份轴位置 (水平面)
  - containerHeight * 0.70: 环境事件起始位置
  - yScale range: [h*0.68, h*0.02] 控制长河高度
  
  如果需要调整布局，修改这些比例即可。
-->

<template>
  <!-- 
    SVG 容器 
    ref="containerRef" 用于获取容器的实际高度 (clientHeight)
  -->
  <div class="river-render-container" ref="containerRef">
    <!-- 
      SVG 画布
      - 宽度: chartWidth (3200px) 固定
      - 高度: 100% 跟随容器
    -->
    <svg :width="chartWidth" :height="'100%'" class="river-svg-stable" 
         @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      
      <!-- SVG 滤镜定义: 制造水墨晕染效果 -->
      <defs>
        <filter id="ink-filter-dh-stable" x="-20%" y="-20%" width="140%" height="140%">
          <!-- 湍流噪声 -->
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <!-- 使用噪声置换图形 -->
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          <!-- 高斯模糊 -->
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>

      <!-- ========== 1. 时期背景层 (era-layer) ========== -->
      <!-- 
        时期背景:
        - 晚清时期 (1864-1911): 棕色 #8b4513
        - 民国时期 (1912-1948): 藏青 #2c3e50  
        - 新中国时期 (1949-1955): 绛红 #c0392b
        - fill-opacity: 0.04 非常淡，作为背景
      -->
      <g class="era-layer">
        <!-- 背景色块 -->
        <rect v-for="(era, idx) in eras" :key="era.name"
          :x="timeScale(era.start)" y="0"
          :width="timeScale(era.end + 1) - timeScale(era.start)" 
          :height="containerHeight"
          :fill="era.color" 
          fill-opacity="0.04"
        />
        <!-- 时期名称 (竖排文字) -->
        <text v-for="era in eras" :key="'lbl-'+era.name"
          :x="timeScale(era.start) + 20" 
          :y="containerHeight * 0.04"
          class="era-title-text"
        >{{ era.name }}</text>
      </g>

      <!-- ========== 2. 生平大河层 (river-content) ========== -->
      <!-- 
        D3.js 堆叠面积图
        - 使用 d3.stack() 将数据按主题堆叠
        - 使用 d3.area() 生成面积路径
        - filter: 应用水墨晕染效果
      -->
      <g class="river-content" filter="url(#ink-filter-dh-stable)">
        <!-- 
          每一层是一个主题
          v-for 遍历 stackedData (堆叠后的数据)
        -->
        <path v-for="layer in stackedData" :key="layer.key"
          :d="areaGenerator(layer)"
          :fill="getThemeColor(layer.key)"
          :fill-opacity="isThemeActive(layer.key) ? 0.75 : 0.08"
          class="river-path"
        />
      </g>

      <!-- ========== 3. 年份轴层 (axis-group) ========== -->
      <!-- 
        年份主轴 - 位于 68% 高度 (水平面位置)
        - 主横线 (粗线)
        - 刻度线 (每5年一个短刻度)
        - 年份标签 (每10年一个)
      -->
      <g class="axis-group" :transform="`translate(0, ${containerHeight * 0.68})`">
        <!-- 主横线 -->
        <line x1="0" y1="0" :x2="chartWidth" y2="0" 
              stroke="#3d2b1f" stroke-width="2" opacity="0.4" />
        
        <!-- 刻度和年份 -->
        <g v-for="year in years" :key="'y-'+year" 
           :transform="`translate(${timeScale(year)}, 0)`">
          <!-- 5年刻度线 -->
          <line v-if="year % 5 === 0" y1="-6" y2="8" 
                stroke="#3d2b1f" stroke-width="0.8" opacity="0.3" />
          <!-- 10年标签 -->
          <text v-if="year % 10 === 0" :y="containerHeight * 0.05" 
                class="axis-label-ya">{{ year }}</text>
        </g>
      </g>

      <!-- ========== 4. 环境事件层 (context-group) ========== -->
      <!-- 
        环境大事 - 位于 70% 以下
        - 从 context_events.json 加载
        - 竖线 + 矩形标记 + 文字标签
        - 使用 (idx % 3) 实现三行错开排列
      -->
      <g class="context-group" :transform="`translate(0, ${containerHeight * 0.70})`">
        <g v-for="(ev, idx) in contextEvents" :key="'ctx-'+idx">
          <!-- 竖线 -->
          <line :x1="timeScale(ev.start)" y1="0" 
                :x2="timeScale(ev.start)" 
                :y2="containerHeight * 0.05 + (idx % 3) * (containerHeight * 0.04)" 
                stroke="#a64d32" stroke-width="1.2" opacity="0.5" />
          <!-- 矩形标记 -->
          <rect :x="timeScale(ev.start) - 1" 
                :y="containerHeight * 0.03 + (idx % 3) * (containerHeight * 0.04)" 
                width="2" 
                :height="containerHeight * 0.04" 
                fill="#a64d32" opacity="0.7" />
          <!-- 文字标签 -->
          <text :x="timeScale(ev.start) + 6" 
                :y="containerHeight * 0.06 + (idx % 3) * (containerHeight * 0.04)" 
                class="context-tag-text">{{ ev.name }}</text>
        </g>
      </g>

      <!-- ========== 5. 交互标尺层 (time-ruler) ========== -->
      <!-- 
        鼠标悬停时显示:
        - 垂直虚线
        - 圆点 (跟随年份轴)
        - 浮窗 (显示当年事件)
      -->
      <g v-if="hoverYear" class="time-ruler" style="pointer-events: none;">
        <!-- 垂直虚线 -->
        <line :x1="timeScale(hoverYear)" y1="0" 
              :x2="timeScale(hoverYear)" :y2="containerHeight" 
              stroke="#c0392b" stroke-width="1.5" stroke-dasharray="5,3" />
        <!-- 圆点 -->
        <circle :cx="timeScale(hoverYear)" :cy="containerHeight * 0.68" 
                r="5" fill="#c0392b" />
        <!-- 浮窗 (foreignObject 嵌入 HTML) -->
        <foreignObject :x="getTooltipX" :y="containerHeight * 0.1" 
                        width="280" height="220">
          <div class="ink-tooltip-stable">
            <div class="tp-year">{{ hoverYear }} 年</div>
            <div class="tp-body" v-if="hoverBucket">
              <!-- 显示权重最高的前3个事件 -->
              <div v-for="ev in topEvents" :key="ev.id" class="tp-item">
                <span class="tp-stamp" :style="{ color: getThemeColor(ev.themes[0]) }">
                  {{ ev.location || '游' }}
                </span>
                <span class="tp-txt">{{ ev.summary }}</span>
              </div>
            </div>
          </div>
        </foreignObject>
      </g>

      <!-- ========== 6. 点击交互层 (interaction-layer) ========== -->
      <!-- 
        透明的点击区域:
        - 每个年份一个 30px 宽的矩形
        - 点击触发 select-year 事件
        - 选中年份显示红点
      -->
      <g class="interaction-layer">
        <!-- 点击热区 -->
        <rect v-for="year in years" :key="'cl-'+year"
          :x="timeScale(year) - 15" y="0" width="30" 
          :height="containerHeight"
          fill="transparent" 
          style="cursor: pointer"
          @click="$emit('select-year', year)"
        />
        <!-- 选中年份的红点 -->
        <circle v-show="selectedYear" 
                :cx="timeScale(selectedYear)" 
                :cy="containerHeight * 0.68" 
                r="8" fill="#c0392b" filter="blur(1px)" />
      </g>
    </svg>
  </div>
</template>

<script>
/**
 * RiverChart 组件
 * 
 * 功能: 使用 D3.js 渲染生平大河堆叠面积图
 * 
 * 核心概念:
 * - timeScale: 时间比例尺 (1864-1955 -> 像素位置)
 * - yScale: 高度比例尺 (权重值 -> 像素高度)
 * - stackedData: D3.stack() 堆叠后的数据
 * - areaGenerator: D3.area() 面积生成器
 */

import * as d3 from 'd3';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'RiverChart',
  
  // 接收父组件传递的属性
  props: { 
    buckets: Array,        // 年份桶数组 [{year, events, byTheme, totalWeight}, ...]
    selectedThemes: Array, // 选中的主题过滤
    selectedYear: Number    // 选中的年份
  },
  
  // 向父组件发送的事件
  emits: ['select-year'],
  
  data() {
    return {
      // SVG 宽度 (固定 3200px，因为需要展示92年)
      chartWidth: 3200,
      
      // 鼠标悬停的年份
      hoverYear: null,
      
      // 环境大事数据 (从 context_events.json 加载)
      contextEvents: [],
      
      // 主题配置
      themes: CHRONOLOGY_THEMES,
      
      // 时期划分
      eras: [
        { name: "晚清時期", start: 1864, end: 1911, color: "#8b4513" },
        { name: "民國時期", start: 1912, end: 1948, color: "#2c3e50" },
        { name: "新中國時期", start: 1949, end: 1955, color: "#c0392b" }
      ]
    };
  },
  
  computed: {
    /**
     * 获取容器实际高度
     * 用于计算 SVG 内各元素的位置比例
     */
    containerHeight() {
      // 优先使用 ref 获取实际高度，回退到 500
      return this.$refs.containerRef?.clientHeight || 500;
    },
    
    /**
     * 生成年份数组 [1864, 1865, ..., 1955]
     */
    years() { 
      return d3.range(1864, 1956); 
    },
    
    /**
     * 时间比例尺
     * 域名: 1864-1955 (黄宾虹一生)
     * 范围: [60, chartWidth-80] (左右留白)
     * 
     * 用法: timeScale(1900) -> 返回 1900 年在 SVG 上的 x 像素位置
     */
    timeScale() { 
      return d3.scaleLinear()
        .domain([1864, 1955])
        .range([60, this.chartWidth - 80]); 
    },
    
    /**
     * Y轴高度比例尺
     * 域名: [0, 最大权重 * 1.5] (预留1.5倍缓冲防止溢出)
     * 范围: [68%高度, 2%高度] (从水平面往上)
     * 
     * 注意: SVG Y轴向下为正，所以大值在上边需要用减法
     * range([h*0.68, h*0.02]) 实现了 Y 轴向上
     */
    yScale() {
      // 找出所有年份桶中最大的 totalWeight
      const maxW = d3.max(this.buckets, b => b.totalWeight) || 100;
      const h = this.containerHeight;
      // 关键: 从 68% 到 2%，实现 Y 轴向上
      return d3.scaleSqrt()
        .domain([0, maxW * 1.5])
        .range([h * 0.68, h * 0.02]);
    },
    
    /**
     * D3 堆叠数据
     * 
     * d3.stack() 会把 bucktes 按主题分组堆叠
     * 返回: [[layer0数据], [layer1数据], ...] 每层是一个主题
     */
    stackedData() {
      if (!this.buckets.length) return [];
      return d3.stack()
        .keys(this.themes.map(t => t.id))
        .value((d, key) => d.byTheme[key]?.totalWeight || 0)
        (this.buckets);
    },
    
    /**
     * D3 面积生成器
     * 
     * x: 使用 timeScale (年份 -> x 像素)
     * y0: 堆叠起始点 (yScale)
     * y1: 堆叠结束点 (yScale)
     * curve: 使用平滑曲线
     */
    areaGenerator() { 
      return d3.area()
        .x(d => this.timeScale(d.data.year))
        .y0(d => this.yScale(d[0]))
        .y1(d => this.yScale(d[1]))
        .curve(d3.curveMonotoneX); 
    },
    
    /**
     * 获取悬停年份对应的年份桶数据
     */
    hoverBucket() { 
      return this.buckets.find(b => b.year === this.hoverYear); 
    },
    
    /**
     * 获取悬停年份中权重最高的前3个事件
     */
    topEvents() {
      if (!this.hoverBucket) return [];
      return [...this.hoverBucket.events]
        .sort((a, b) => b.socialWeight - a.socialWeight)
        .slice(0, 3);
    },
    
    /**
     * 计算浮窗的 X 位置
     * 如果靠近右边缘，放到左边
     */
    getTooltipX() {
      const x = this.timeScale(this.hoverYear);
      return x + 300 > this.chartWidth ? x - 290 : x + 20;
    }
  },
  
  /**
   * 组件挂载后加载环境事件数据
   */
  async mounted() {
    try {
      const res = await fetch('/data/context_events.json');
      this.contextEvents = await res.json();
    } catch (e) { 
      console.error(e); 
    }
    if (this.selectedYear) this.scrollToYear(this.selectedYear);
  },
  
  methods: {
    /**
     * 获取主题颜色
     */
    getThemeColor(id) { 
      const theme = this.themes.find(t => t.id === id);
      return theme?.color || '#999'; 
    },
    
    /**
     * 判断主题是否激活
     * 如果有选中主题，返回是否在选中列表中
     * 如果没有选中主题，全部激活
     */
    isThemeActive(id) { 
      return !this.selectedThemes.length || this.selectedThemes.includes(id); 
    },
    
    /**
     * 鼠标移动事件处理
     * 将鼠标 X 位置转换为年份
     */
    onMouseMove(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const year = Math.round(this.timeScale.invert(x));
      if (year >= 1864 && year <= 1955) this.hoverYear = year;
    },
    
    /**
     * 鼠标离开事件处理
     */
    onMouseLeave() { this.hoverYear = null; },
    
    /**
     * 滚动到指定年份 (目前未实现)
     */
    scrollToYear(year) {
      // 外部父组件处理滚动
    }
  }
};
</script>

<style scoped>
/* 
  SVG 容器
  - width/height: 100% 跟随父容器
  - min-height: 最小高度防止内容压缩
  - background: 宣纸色 + 纹理
*/
.river-render-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
}

/* 时期标题文字 - 竖排 */
.era-title-text {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 18px;
  fill: #3d2b1f; /* 墨色 */
  opacity: 0.12;
  writing-mode: vertical-rl;
  letter-spacing: 5px;
}

/* 年份标签 */
.axis-label-ya {
  font-family: "Georgia", serif;
  font-size: 11px;
  fill: #3d2b1f; /* 墨色 */
  opacity: 0.6;
  text-anchor: middle;
}

/* 环境事件标签 */
.context-tag-text { 
  font-family: "KaiTi", serif; 
  font-size: 11px; 
  fill: #a64d32; 
  opacity: 0.7; 
  pointer-events: none; 
}

/* 浮窗样式 */
.ink-tooltip-stable { 
  background: rgba(253, 245, 230, 0.98); 
  border: 1.5px solid #d2b48c; 
  padding: 10px; 
  box-shadow: 6px 6px 20px rgba(0,0,0,0.12); 
  font-family: "KaiTi", serif; 
  border-radius: 4px; 
}

/* 浮窗内年 */
.tp-year { 
  border-bottom: 2px solid #c0392b; 
  color: #c0392b; 
  font-weight: bold; 
  font-size: 16px; 
  margin-bottom: 8px; 
  padding-bottom: 4px; 
}

/* 浮窗内事件项 */
.tp-item { 
  display: flex; 
  gap: 10px; 
  margin-bottom: 8px; 
  align-items: flex-start; 
}

/* 浮窗内地点印章 */
.tp-stamp { 
  font-size: 9px; 
  border: 1px solid currentColor; 
  padding: 2px; 
  writing-mode: vertical-rl; 
  border-radius: 2px; 
}

/* 浮窗内摘要文字 */
.tp-txt { 
  font-size: 13.5px; 
  line-height: 1.45; 
  color: #3d2b1f; 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

/* 长河路径 - 鼠标悬停时透明度过渡 */
.river-path { 
  transition: fill-opacity 0.4s; 
  cursor: pointer; 
}
</style>
