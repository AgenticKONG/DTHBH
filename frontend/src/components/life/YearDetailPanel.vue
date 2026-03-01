<template>
  <div class="year-detail-side-panel">
    <!-- 無選中年份時的占位提示 (NULL Pointer Exception Guard) -->
    <div v-if="!bucket" class="placeholder-side">
      <i class="fas fa-feather-alt"></i>
      <p>請點擊左側大河年份<br/>研讀賓翁生平</p>
    </div>
    
    <!-- 有選中年份時顯示詳情 (View Render) -->
    <div v-else class="side-content">
      <!-- 1. 面板 Header：年份標題與模式開關 -->
      <div class="side-header">
        <div class="side-year-title">公元 {{ bucket.year }} 年</div>
        
        <!-- 摘要/史料模式切換 (Display Mode Toggle) -->
        <div class="side-mode-switch" @click="studyMode = !studyMode">
          <span :class="{ active: !studyMode }">摘要</span>
          <div class="mini-toggle">
            <div class="mini-ball" :class="{ right: studyMode }"></div>
          </div>
          <span :class="{ active: studyMode }">史料</span>
        </div>
      </div>

      <!-- 2. 分頁容器 (Pager Content)：受 currentPage 驅動 -->
      <div v-if="currentTheme" class="theme-page-container" :key="currentPage + '-' + bucket?.year">
        
        <!-- 當前主題標題與導航 -->
        <div class="theme-header-nav">
          <div class="side-theme-banner" :style="{ color: currentTheme.color }">
            {{ currentTheme.label }}
          </div>
          
          <!-- 主題分頁器 (Pager Controls) -->
          <div v-if="totalPages > 1" class="side-pager">
            <button class="pager-btn" 
                    @click="currentPage = Math.max(0, currentPage - 1)" 
                    :disabled="currentPage === 0">‹</button>
            <span class="pager-text">{{ currentPage + 1 }}/{{ totalPages }}</span>
            <button class="pager-btn" 
                    @click="currentPage = Math.min(totalPages - 1, currentPage + 1)" 
                    :disabled="currentPage === totalPages - 1">›</button>
          </div>
        </div>
        
        <!-- 3. 垂直事件隊列 (Event Stack)：可滾動區域 -->
        <div class="side-scroll-area custom-scrollbar-ya">
          <div v-for="ev in currentTheme.events" 
               :key="ev.id" 
               class="side-event-card" 
               :class="{ 'study-view': studyMode }">
            
            <!-- 卡片頂部：地點印章與日期 -->
            <div class="side-card-top">
              <span class="side-loc-tag">{{ ev.location || '游蹤' }}</span>
              <span class="side-ev-date">{{ ev.rawDate }}</span>
            </div>
            
            <!-- 卡片主體：正文內容 (摘要 vs 完整詳情) -->
            <div class="side-card-body">
              <div v-if="studyMode" class="side-details">{{ ev.details }}</div>
              <div v-else class="side-summary">{{ ev.summary }}</div>
            </div>
            
            <!-- 卡片底部：文物/作品引用 -->
            <div v-if="ev.artifacts && ev.artifacts.length" class="side-artifacts">
              <span v-for="art in ev.artifacts" :key="art" class="side-art-tag"># {{ art }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * YearDetailPanel - 側邊研讀面板
 * 功能：按主題分頁展示特定年份的事件，支持摘要與史料模式切換。
 */
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'YearDetailPanel',
  props: {
    bucket: Object,         // 選中的年份數據對象
    selectedThemes: Array   // 外部傳入的主題過濾器
  },
  data() {
    return {
      studyMode: false,     // 顯示模式：false=摘要, true=史料
      currentPage: 0        // 分頁索引
    };
  },
  computed: {
    /**
     * 數據預處理：根據過濾器篩選事件
     */
    filteredEvents() {
      if (!this.bucket) return [];
      if (!this.selectedThemes.length) return this.bucket.events;
      return this.bucket.events.filter(ev => 
        ev.themes.some(t => this.selectedThemes.includes(t))
      );
    },
    /**
     * 數據重構：將事件按主題 ID 進行 GroupBy 操作，形成分頁隊列
     */
    themeGroups() {
      if (!this.bucket) return [];
      const groups = [];
      const activeIds = this.selectedThemes.length > 0 
        ? this.selectedThemes 
        : CHRONOLOGY_THEMES.map(t => t.id);

      activeIds.forEach(id => {
        const meta = CHRONOLOGY_THEMES.find(t => t.id === id);
        const evs = this.filteredEvents.filter(ev => ev.themes.includes(id));
        if (evs.length) groups.push({ ...meta, events: evs });
      });
      return groups;
    },
    currentTheme() { return this.themeGroups[this.currentPage] || null; },
    totalPages() { return this.themeGroups.length; }
  },
  watch: {
    /**
     * 監聽器：當選中年份改變時，自動重置分頁指針到第一頁
     */
    bucket() {
      this.currentPage = 0;
    }
  }
};
</script>

<style scoped>
/* 側邊欄容器：物理鎖定，防止撐開視口 */
.year-detail-side-panel {
  height: 100%; width: 100%; display: flex; flex-direction: column;
  background-color: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  overflow: hidden; box-sizing: border-box;
}

.side-content { height: 100%; display: flex; flex-direction: column; }

/* 頂部固定 Header 樣式 */
.side-header {
  padding: 20px; background: rgba(244, 239, 223, 0.95);
  border-bottom: 2px solid #c0392b; flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
}

.side-year-title { font-family: "KaiTi", serif; font-size: 22px; font-weight: bold; color: #5c4033; }

/* 自定義膠囊切換開關 */
.side-mode-switch { display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: #8b7d6b; }
.side-mode-switch span.active { color: #c0392b; font-weight: bold; }
.mini-toggle { width: 30px; height: 14px; background: #d2b48c; border-radius: 7px; position: relative; }
.mini-ball { width: 10px; height: 10px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
.mini-ball.right { left: 18px; background: #c0392b; }

/* 分頁內容區佈局 */
.theme-page-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.theme-header-nav { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.3); flex-shrink: 0; }
.side-theme-banner { font-family: "KaiTi", serif; font-size: 16px; font-weight: bold; border-left: 4px solid currentColor; padding-left: 10px; letter-spacing: 2px; }

/* 獨立滾動區 (Scrollable Stack) */
.side-scroll-area {
  flex: 1; overflow-y: scroll !important; /* 強制常駐滾軸，供分析校準 */
  padding: 15px 20px; box-sizing: border-box;
}

/* 卡片與印章樣式 */
.side-event-card { background: #fff; border: 1px solid #d2b48c; padding: 15px; margin-bottom: 15px; border-radius: 2px; box-shadow: 2px 2px 5px rgba(0,0,0,0.03); }
.side-loc-tag { font-family: "KaiTi", serif; font-size: 11px; background: #c0392b; color: #fff; padding: 1px 6px; border-radius: 2px; }
.side-ev-date { font-size: 11px; color: #8b7d6b; font-family: "Georgia"; }
.side-summary { font-size: 14px; line-height: 1.6; color: #3d2b1f; }
.side-details { font-size: 13.5px; line-height: 1.8; color: #5c4033; text-align: justify; white-space: pre-wrap; }

/* 滾動條美化 (Webkit) */
.custom-scrollbar-ya::-webkit-scrollbar { width: 8px !important; display: block !important; }
.custom-scrollbar-ya::-webkit-scrollbar-track { background: rgba(244, 239, 223, 0.3); }
.custom-scrollbar-ya::-webkit-scrollbar-thumb { background-color: #8b4513 !important; border-radius: 4px; }
</style>
