<template>
  <div class="life-river-wrapper">
    <!-- 1. 加載狀態 (Loading Guard) -->
    <div v-if="loading" class="loading-state">
      <div class="ink-loader"></div>
      正在載入編年數據……
    </div>
    
    <!-- 2. 主視圖渲染區 (Main Viewport) -->
    <div v-else class="river-layout-root">
      
      <!-- 左側欄：長卷地圖與導航區 (佔據 flex: 1 剩餘寬度) -->
      <div class="river-left-pane">
        
        <!-- 核心橫向滾動窗口 (Scroll Window) -->
        <div class="river-scroll-box custom-scrollbar-ya" ref="scrollContainer" @wheel.prevent="onWheel">
          
          <!-- 虛擬畫布 (Canvas)：物理寬度死鎖在 3200px，高度跟隨容器 100% -->
          <div class="river-canvas-entity">
            <RiverChart
              :buckets="yearBuckets"
              :selected-themes="selectedThemes"
              :selected-year="selectedYear"
              @select-year="onSelectYear"
            />
          </div>
        </div>
        
        <!-- 底部圖例欄 (Fixed Footer Legend)：固定高度 54px -->
        <div class="river-footer-legend">
          <ThemeFilterBar
            :themes="themes"
            v-model="selectedThemes"
          />
        </div>
      </div>

      <!-- 右側欄：詳情面板 (Side Panel)：固定寬度 320px，類似代碼編輯器的側邊導航 -->
      <div class="river-right-detail">
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
 * LifeRiverView - 項目總控組件
 * 類似於 C++ 中的主循環/控制器，負責數據獲取、結構化處理及組件間的信號通信。
 */
import RiverChart from '@/components/life/RiverChart.vue';
import ThemeFilterBar from '@/components/life/ThemeFilterBar.vue';
import YearDetailPanel from '@/components/life/YearDetailPanel.vue';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';
import { parseCsv, parseDateToYMD, assignThemes, buildYearBuckets } from '@/utils/chronology';

export default {
  name: 'LifeRiverView',
  components: { RiverChart, ThemeFilterBar, YearDetailPanel },
  data() {
    return {
      loading: true,        // 加載標誌位
      events: [],           // 扁平化的原始數據數組
      yearBuckets: [],      // 按年份聚合後的桶（Buckets），D3 渲染的核心數據源
      selectedYear: null,   // 當前選中的年份「指針」
      selectedThemes: [],   // 當前激活的主題過濾器（Bitmask 效果）
      themes: CHRONOLOGY_THEMES,
      chartWidth: 3200      // 長卷物理總長度 (單位: px)
    };
  },
  computed: {
    /**
     * 獲取當前選中年份的桶數據
     * 類似於按 key 從 Map 中檢索對象
     */
    currentBucket() {
      if (!this.selectedYear) return null;
      return this.yearBuckets.find(b => b.year === this.selectedYear) || null;
    }
  },
  async mounted() {
    /**
     * 程序入口：加載數據並執行轉換流水線
     */
    try {
      const res = await fetch('/data/chronology_full.csv');
      const text = await res.text();
      const rows = parseCsv(text);
      
      // 數據轉換流水線 (Transform Pipeline)
      const events = rows.map((row) => {
        const { year, month, day } = parseDateToYMD(row.Exact_Date);
        const ev = {
          id: row.Event_ID,
          year, month, day,
          rawDate: row.Exact_Date,
          location: row.Master_Location || null,
          action: row.Subject_Action || '',
          summary: row.Summary_Text || '',
          details: row.Details_Evidence || '',
          artifacts: (row.Artifact_Refs || '').split(/[;，,]/).map(s => s.trim()).filter(Boolean),
          socialWeight: parseInt(row.Social_Weight, 10) || 0
        };
        // 基於關鍵詞的自動打標邏輯
        ev.themes = assignThemes(ev);
        return ev;
      }).filter(ev => !isNaN(ev.year)); // 剔除髒數據

      this.events = events;
      // 構建 D3 渲染所需的年份聚合數據
      this.yearBuckets = buildYearBuckets(events);
      
      // 初始選中出生年份
      if (this.yearBuckets.length) this.selectedYear = 1864;
      this.loading = false;
    } catch (e) { console.error('數據加載失敗:', e); }
  },
  methods: {
    /**
     * 回調函數：接收來自 RiverChart 的點擊信號
     */
    onSelectYear(year) { this.selectedYear = year; },
    
    /**
     * 鼠標滾輪攔截：將 Y 軸滾動量轉換為橫向 X 軸滾動偏移
     * 類似於 C++ 中重載鼠標事件
     */
    onWheel(e) {
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.scrollLeft += e.deltaY;
      }
    }
  }
};
</script>

<style scoped>
/* 核心佈局定義 */
.life-river-wrapper {
  width: 100vw; height: 100vh; background: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  padding-top: 60px; /* 給頂部導航欄預留硬性寬度 */
  overflow: hidden;
  box-sizing: border-box;
}

/* 左右分欄：利用 Flexbox 實現側邊欄固定寬度、左側自動填滿 */
.river-layout-root {
  display: flex; width: 100%; height: calc(100vh - 60px);
}

.river-left-pane {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  background: #fffef9;
}

/* 橫向滾動容器：y 軸 hidden 是為了防止出現雙滾動條災難 */
.river-scroll-box {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden; 
  width: 100%;
  display: flex;
  align-items: stretch;
}

/* 邏輯畫布實體：這是長卷的真實物理尺寸 */
.river-canvas-entity {
  width: 3200px; 
  height: 100%;
  flex-shrink: 0;
}

.river-footer-legend {
  height: 54px; flex-shrink: 0;
  background: #f4efdf;
  border-top: 1px solid #d2b48c;
  display: flex; align-items: center; justify-content: center;
}

.river-right-detail {
  width: 320px; /* 右側欄固定寬度，類似 Side Drawer */
  flex-shrink: 0;
  background: #fdf5e6; border-left: 1px solid #d2b48c;
  overflow: hidden;
}

/* 滾動條樣式優化 (Webkit Engine Only) */
.custom-scrollbar-ya::-webkit-scrollbar { height: 10px; display: block; }
.custom-scrollbar-ya::-webkit-scrollbar-track { background: rgba(210, 180, 140, 0.1); }
.custom-scrollbar-ya::-webkit-scrollbar-thumb {
  background-color: #d2b48c; border-radius: 5px;
  border: 2px solid #fffef9;
}
.custom-scrollbar-ya::-webkit-scrollbar-thumb:hover { background-color: #8b4513; }

.loading-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: "KaiTi", serif; font-size: 24px; color: #5c4033;
}
.ink-loader {
  width: 40px; height: 40px; border: 3px solid #5c4033; border-top-color: transparent;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
