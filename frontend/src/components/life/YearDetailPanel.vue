<!--
  YearDetailPanel.vue - 年份詳情側邊面板
  融合了合作者的主題分頁邏輯與本地的水墨窄邊欄美學
-->

<template>
  <div class="year-detail-side-panel">
    <!-- 無選中年份時的占位提示 -->
    <div v-if="!bucket" class="placeholder-side">
      <i class="fas fa-feather-alt"></i>
      <p>請點擊左側大河年份<br/>研讀賓翁生平</p>
    </div>
    
    <!-- 有選中年份時顯示詳情 -->
    <div v-else class="side-content">
      <!-- 頂部: 年份標題 + 模式切換 -->
      <div class="side-header">
        <div class="side-year-title">公元 {{ bucket.year }} 年</div>
        
        <!-- 摘要/史料模式切換開關 -->
        <div class="side-mode-switch" @click="studyMode = !studyMode">
          <span :class="{ active: !studyMode }">摘要</span>
          <div class="mini-toggle">
            <div class="mini-ball" :class="{ right: studyMode }"></div>
          </div>
          <span :class="{ active: studyMode }">史料</span>
        </div>
      </div>

      <!-- 主體: 主題內容區域 (分頁顯示) -->
      <div v-if="currentTheme" class="theme-page-container" :key="currentPage + '-' + bucket?.year">
        
        <!-- 主題標題與分頁器 -->
        <div class="theme-header-nav">
          <div class="side-theme-banner" :style="{ color: currentTheme.color }">
            {{ currentTheme.label }}
          </div>
          
          <!-- 全新銘牌式分頁器 -->
          <div v-if="totalPages > 1" class="side-pager-tablet">
            <button class="pager-tablet-btn" 
                    @click="currentPage = Math.max(0, currentPage - 1)" 
                    :disabled="currentPage === 0">‹</button>
            <span class="pager-tablet-text">{{ currentPage + 1 }}/{{ totalPages }}</span>
            <button class="pager-tablet-btn" 
                    @click="currentPage = Math.min(totalPages - 1, currentPage + 1)" 
                    :disabled="currentPage === totalPages - 1">›</button>
          </div>
        </div>
        
        <!-- 事件列表 (滾動區) -->
        <div class="side-scroll-area custom-scrollbar-ya">
          <div v-for="ev in currentTheme.events" 
               :key="ev.id" 
               class="side-event-card" 
               :class="{ 'study-view': studyMode }">
            
            <div class="side-card-top">
              <span class="side-loc-tag">{{ ev.location || '游蹤' }}</span>
              <span class="side-ev-date">{{ ev.rawDate }}</span>
            </div>
            
            <div class="side-card-body">
              <template v-if="studyMode">
                <!-- 史料模式：若有內容則顯示，若無則顯示「待錄」提示 -->
                <div v-if="ev.details && ev.details.trim()" class="side-details">
                  {{ ev.details }}
                </div>
                <div v-else class="side-details-pending">
                  <i class="fas fa-info-circle"></i> 詳情補遺待錄
                </div>
              </template>
              <div v-else class="side-summary">{{ ev.summary }}</div>
            </div>
            
            <!-- 優化後的引用標籤 -->
            <div v-if="ev.artifacts && ev.artifacts.length" class="side-artifacts">
              <span v-for="art in ev.artifacts" :key="art" class="side-art-tag">#{{ art }}</span>
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
    bucket: Object,
    selectedThemes: Array
  },
  data() {
    return {
      studyMode: false,
      currentPage: 0
    };
  },
  computed: {
    filteredEvents() {
      if (!this.bucket) return [];
      if (!this.selectedThemes.length) return this.bucket.events;
      return this.bucket.events.filter(ev => 
        ev.themes.some(t => this.selectedThemes.includes(t))
      );
    },
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
    bucket() { this.currentPage = 0; }
  }
};
</script>

<style scoped>
/* 側邊欄總容器 */
.year-detail-side-panel {
  height: 100%; width: 100%; display: flex; flex-direction: column;
  background-color: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  overflow: hidden; box-sizing: border-box;
}

.side-content { height: 100%; display: flex; flex-direction: column; }

.placeholder-side {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: "KaiTi", serif; color: #8b7d6b; line-height: 1.6; opacity: 0.6;
}

/* Header 防止不換行 */
.side-header {
  padding: 20px; background: rgba(244, 239, 223, 0.95);
  border-bottom: 2px solid #c0392b; flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
}

.side-year-title { 
  font-family: "KaiTi", serif; font-size: 22px; font-weight: bold; color: #5c4033;
  white-space: nowrap; flex-shrink: 0;
}

.side-mode-switch { 
  display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; color: #8b7d6b;
  white-space: nowrap; flex-shrink: 0;
}
.side-mode-switch span.active { color: #c0392b; font-weight: bold; }
.mini-toggle { width: 30px; height: 14px; background: #d2b48c; border-radius: 7px; position: relative; }
.mini-ball { width: 10px; height: 10px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
.mini-ball.right { left: 18px; background: #c0392b; }

.theme-page-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.theme-header-nav { 
  padding: 15px 32px 15px 20px; /* 右側增加補償，確保翻頁器視覺上不超出卡片 */
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background: rgba(255, 255, 255, 0.2); 
  flex-shrink: 0; 
}

.side-theme-banner { 
  font-family: "KaiTi", serif; font-size: 16px; font-weight: bold; 
  border-left: 4px solid currentColor; padding-left: 10px; letter-spacing: 2px; 
}

/* 全新銘牌式分頁器樣式 */
.side-pager-tablet {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(210, 180, 140, 0.4);
  padding: 2px 10px;
  border-radius: 2px;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.02);
}

.pager-tablet-text { 
  font-family: "Georgia", serif; font-size: 12px; color: #3d2b1f; opacity: 0.8;
}

.pager-tablet-btn {
  background: transparent; border: none; font-size: 20px; line-height: 1;
  color: #8b7d6b; cursor: pointer; padding: 0 4px; transition: all 0.3s ease;
}
.pager-tablet-btn:hover:not(:disabled) { color: #c0392b; transform: scale(1.1); }
.pager-tablet-btn:disabled { opacity: 0.2; cursor: not-allowed; }

/* 滾動區 */
.side-scroll-area {
  flex: 1; overflow-y: scroll !important;
  padding: 15px 20px; box-sizing: border-box;
}

.side-event-card { background: #fff; border: 1px solid #d2b48c; padding: 15px; margin-bottom: 15px; border-radius: 2px; box-shadow: 2px 2px 5px rgba(0,0,0,0.03); }
.side-loc-tag { font-family: "KaiTi", serif; font-size: 11px; background: #c0392b; color: #fff; padding: 1px 6px; border-radius: 2px; }
.side-ev-date { font-size: 11px; color: #8b7d6b; font-family: "Georgia"; }
.side-summary { font-size: 14px; line-height: 1.6; color: #3d2b1f; }
.side-details { font-size: 13.5px; line-height: 1.8; color: #5c4033; text-align: justify; white-space: pre-wrap; }

/* 史料待錄樣式 */
.side-details-pending {
  font-size: 12px;
  color: #8b7d6b;
  font-style: italic;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.7;
}

.side-artifacts { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.side-art-tag {
  font-size: 10px; color: rgba(192, 57, 43, 0.8); background: rgba(192, 57, 43, 0.03);
  padding: 1px 6px; border-radius: 10px; border: 0.5px solid rgba(192, 57, 43, 0.1);
  font-family: "SimSun", serif;
}

/* 滾動條樣式優化 */
.custom-scrollbar-ya::-webkit-scrollbar { width: 6px; display: block; }
.custom-scrollbar-ya::-webkit-scrollbar-thumb { background-color: #d2b48c; border-radius: 3px; }
</style>
