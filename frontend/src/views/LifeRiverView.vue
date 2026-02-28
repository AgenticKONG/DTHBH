<!--
  生平大河 (Life River) 主页面
  
  页面布局 (从左到右):
  ┌──────────────────────────────────────────────────────┬────────────┐
  │                    左：长卷区域 (RiverChart)           │  右：详情区  │
  │  ┌──────────────────────────────────────────────┐    │  (YearDetail)│
  │  │  可横向滚动的 SVG 图表                       │    │              │
  │  │  宽度 3200px，高度占满容器                   │    │  显示选中年份  │
  │  │                                              │    │  的事件详情   │
  │  └──────────────────────────────────────────────┘    │              │
  │  ┌──────────────────────────────────────────────┐    │              │
  │  │  主题过滤栏 (ThemeFilterBar) - 6个按钮       │    │              │
  │  └──────────────────────────────────────────────┘    │              │
  └──────────────────────────────────────────────────────┴────────────┘

  核心概念:
  - bucket (年份桶): 按年份分组的事件集合
  - theme (主题): 事件分类，如"艺术创作"、"社会活动"等
  - yearBuckets: 所有年份桶的数组，用于渲染长河
-->

<template>
  <!-- 页面最外层容器: 100vw x 100vh -->
  <div class="life-river-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      正在載入編年數據……
    </div>
    
    <!-- 主布局: flex 左右分栏 -->
    <div v-else class="river-layout-root">
      <!-- 左侧: 长卷展示区 (flex: 1 自适应宽度) -->
      <div class="river-left-pane">
        <!-- 
          可滚动区域:
          - overflow-x: auto 允许横向滚动
          - overflow-y: hidden 禁止纵向滚动
          - @wheel.prevent 捕获鼠标滚轮事件用于横向滚动
        -->
        <div class="river-scroll-box" ref="scrollContainer" @wheel.prevent="onWheel">
          <!-- 
            长河图表容器:
            - 宽度固定 3200px (因为时间跨度 1864-1955 年需要足够像素)
            - 高度 96% (上下各 2% 留白)
          -->
          <div class="river-canvas-entity">
            <!-- 
              RiverChart 组件 - 核心可视化组件
              属性:
              - buckets: 年份桶数组，用于渲染堆叠面积图
              - selectedThemes: 当前选中的主题过滤数组
              - selectedYear: 当前选中的年份
              事件:
              - select-year: 点击年份时触发
            -->
            <RiverChart
              :buckets="yearBuckets"
              :selected-themes="selectedThemes"
              :selected-year="selectedYear"
              @select-year="onSelectYear"
            />
          </div>
        </div>
        
        <!-- 底部: 主题过滤栏 -->
        <div class="river-footer-legend">
          <!-- 
            ThemeFilterBar 组件
            - v-model 双向绑定选中主题数组
            - themes: 所有可用主题列表
          -->
          <ThemeFilterBar
            :themes="themes"
            v-model="selectedThemes"
          />
        </div>
      </div>

      <!-- 
        右侧: 详情面板
        - 宽度 28% (UI规约建议22%~30%)
        - 最小280px，最大400px
      -->
      <div class="river-right-detail">
        <!-- 
          YearDetailPanel 组件
          - bucket: 当前选中年份的事件数据
          - selectedThemes: 用于过滤显示
        -->
        <YearDetailPanel
          :bucket="currentBucket"
          :selected-themes="selectedThemes"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 组件说明:
 * RiverChart: D3.js 可视化长河图表
 * ThemeFilterBar: 主题过滤按钮组
 * YearDetailPanel: 年份详情展示面板
 */

import RiverChart from '@/components/life/RiverChart.vue';
import ThemeFilterBar from '@/components/life/ThemeFilterBar.vue';
import YearDetailPanel from '@/components/life/YearDetailPanel.vue';

// 主题配置
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

// 数据处理工具函数
import { parseCsv, parseDateToYMD, assignThemes, buildYearBuckets } from '@/utils/chronology';

export default {
  name: 'LifeRiverView',
  
  // 子组件
  components: { RiverChart, ThemeFilterBar, YearDetailPanel },
  
  data() {
    return {
      // 加载状态
      loading: true,
      
      // 原始事件数组 (所有年份的事件)
      events: [],
      
      // 年份桶数组 (按年份分组后的事件集合)
      // 结构: [{ year: 1864, events: [...], byTheme: {...}, totalWeight: 10 }, ...]
      yearBuckets: [],
      
      // 当前选中的年份 (用于高亮和显示详情)
      selectedYear: null,
      
      // 当前选中的主题过滤 (空数组表示显示所有主题)
      selectedThemes: [],
      
      // 所有可用主题列表
      themes: CHRONOLOGY_THEMES
    };
  },
  
  computed: {
    /**
     * 计算当前选中年份对应的年份桶数据
     * 用于传递给 YearDetailPanel 组件显示详情
     */
    currentBucket() {
      // 如果没有选中年份，返回 null
      if (!this.selectedYear) return null;
      // 从 yearBuckets 数组中查找对应年份的桶
      return this.yearBuckets.find(b => b.year === this.selectedYear) || null;
    }
  },
  
  /**
   * 生命周期: 组件挂载后执行
   * 职责: 加载 CSV 数据并处理
   */
  async mounted() {
    try {
      // 1. 获取原始 CSV 数据
      const res = await fetch('/data/chronology_full.csv');
      const text = await res.text();
      
      // 2. 解析 CSV 为数组
      const rows = parseCsv(text);
      
      // 3. 转换为事件对象数组
      const events = rows.map((row) => {
        // 解析日期 (返回 {year, month, day})
        const { year, month, day } = parseDateToYMD(row.Exact_Date);
        
        // 构建事件对象
        const ev = {
          id: row.Event_ID,           // 事件ID
          year, month, day,          // 年月日
          rawDate: row.Exact_Date,   // 原始日期字符串
          location: row.Master_Location || null,  // 地点
          action: row.Subject_Action || '',         // 动作/行为
          summary: row.Summary_Text || '',         // 摘要
          details: row.Details_Evidence || '',     // 详细描述
          // 艺术品/文物引用 (按分号/逗号分割)
          artifacts: (row.Artifact_Refs || '').split(/[;，,]/).map(s => s.trim()).filter(Boolean),
          // 社会权重 (数值越大表示越重要)
          socialWeight: parseInt(row.Social_Weight, 10) || 0
        };
        
        // 4. 自动分配主题标签
        ev.themes = assignThemes(ev);
        
        return ev;
      })
      // 过滤掉无法解析年份的事件
      .filter(ev => !isNaN(ev.year));

      // 保存原始事件
      this.events = events;
      
      // 5. 构建年份桶 (按年份分组)
      this.yearBuckets = buildYearBuckets(events);
      
      // 6. 默认选中年份 (1864 年，黄宾虹出生年)
      if (this.yearBuckets.length) {
        this.selectedYear = 1864;
      }
      
      // 加载完成
      this.loading = false;
    } catch (e) {
      console.error(e);
    }
  },
  
  methods: {
    /**
     * 处理年份选择事件
     * 由 RiverChart 组件的点击事件触发
     * @param {number} year - 选中的年份
     */
    onSelectYear(year) {
      this.selectedYear = year;
    },
    
    /**
     * 处理鼠标滚轮事件
     * 将垂直滚轮转换为横向滚动
     * @param {WheelEvent} e - 滚轮事件对象
     */
    onWheel(e) {
      if (this.$refs.scrollContainer) {
        // deltaY > 0 表示向下滚动 (往右)
        // deltaY < 0 表示向上滚动 (往左)
        this.$refs.scrollContainer.scrollLeft += e.deltaY;
      }
    }
  }
};
</script>

<!-- 
  样式说明:
  
  1. life-river-wrapper
     - 页面最外层，100vw x 100vh
     - 背景: 宣纸色 #fdf5e6 + 纹理图片
     - padding-top: 60px 给顶部导航留空间
  
  2. river-layout-root  
     - Flex 布局，水平分栏
     - 高度: calc(100vh - 60px)
  
  3. river-left-pane
     - 左栏: flex:1 自适应
     - flex-direction: column 垂直排列
  
  4. river-scroll-box
     - 横向滚动容器
     - overflow-x: auto 启用原生滚动
     - align-items: stretch 拉伸填满高度
  
  5. river-canvas-entity
     - 长河图表容器
     - 宽度: 3200px (固定像素，因为需要足够宽度展示92年)
     - 高度: 96% (上下各2%留白)
  
  6. river-footer-legend
     - 底部图例栏，高度50px
     - 背景: #f4efdf
  
  7. river-right-detail
     - 右侧详情栏
     - 宽度: 28% (22%~30%范围内)
     - min-width/max-width 限制范围
-->

<style scoped>
/* 页面最外层 */
.life-river-wrapper {
  width: 100vw; 
  height: 100vh;
  /* 宣纸色背景 + 纹理 */
  background: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  padding-top: 60px; /* 顶部留白给导航 */
  overflow: hidden;
}

/* 主布局: flex 左右分栏 */
.river-layout-root {
  display: flex; 
  width: 100%; 
  height: calc(100vh - 60px);
}

/* 左侧栏: 自适应宽度，垂直布局 */
.river-left-pane {
  flex: 1;        /* 占据剩余空间 */
  min-width: 0;   /* 防止 flex 子项溢出 */
  display: flex; 
  flex-direction: column;
}

/* 
  横向滚动容器
  关键: overflow-x: auto 启用横向滚动
*/
.river-scroll-box {
  flex: 1;
  overflow-x: auto; /* 关键: 允许横向滚动 */
  overflow-y: hidden;
  display: flex;
  align-items: stretch; /* 拉伸填满高度 */
}

/* 横向滚动条样式 - 赭石色 */
.river-scroll-box::-webkit-scrollbar {
  height: 10px;
}
.river-scroll-box::-webkit-scrollbar-track {
  background: rgba(210, 180, 140, 0.2);
}
.river-scroll-box::-webkit-scrollbar-thumb {
  background: #d2b48c;
  border-radius: 5px;
}

/* 
  长河图表容器
  关键: 宽度固定 3200px，高度 96%
*/
.river-canvas-entity {
  width: 3200px;   /* 固定宽度，需要足够展示 1864-1955 年 */
  height: 96%;     /* 上下各 2% 留白 */
  margin: 2% 0;
  flex-shrink: 0;  /* 防止被压缩 */
}

/* 底部图例栏 */
.river-footer-legend {
  height: 50px;
  background: #f4efdf;
  border-top: 1px solid rgba(139, 69, 19, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 
  右侧详情栏
  宽度: 28% (UI规约建议22%~30%)
*/
.river-right-detail {
  width: 28%; 
  min-width: 280px;
  max-width: 400px;
  flex-shrink: 0;
  background: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  border-left: 1px solid #d2b48c;
  overflow-y: auto;
}

/* 右侧纵向滚动条样式 */
.river-right-detail::-webkit-scrollbar {
  width: 10px;
}
.river-right-detail::-webkit-scrollbar-track {
  background: rgba(210, 180, 140, 0.2);
  border-radius: 5px;
}
.river-right-detail::-webkit-scrollbar-thumb {
  background: #d2b48c; /* 赭石色 */
  border-radius: 5px;
}
.river-right-detail::-webkit-scrollbar-thumb:hover {
  background: #c4a47a;
}

/* 加载状态 */
.loading-state {
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  font-family: "KaiTi", serif; 
  font-size: 24px; 
  color: #5c4033;
}
</style>
