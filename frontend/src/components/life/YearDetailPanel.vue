<!--
  YearDetailPanel.vue - 年份详情面板组件
  
  功能:
  - 显示选中年份的事件详情
  - 支持主题翻页
  - 支持摘要/史料模式切换
  
  布局:
  ┌────────────────────────────────────────┐
  │  顶部: 年份标题 + 摘要/史料切换开关        │
  ├────────────────────────────────────────┤
  │  主体: 主题内容区域                       │
  │  ┌──────────────────────────────────┐  │
  │  │  主题标签 + 翻页器               │  │
  │  ├──────────────────────────────────┤  │
  │  │  事件卡片列表 (可滚动)            │  │
  │  │  ┌────────────────────────────┐  │  │
  │  │  │ 地点印章 │ 事件内容         │  │  │
  │  │  └────────────────────────────┘  │  │
  │  └──────────────────────────────────┘  │
  └────────────────────────────────────────┘
-->

<template>
  <!-- 最外层容器 -->
  <div class="year-detail-outer">
    
    <!-- 无选中年份时的占位提示 -->
    <div v-if="!bucket" class="placeholder-ya">
      <i class="fas fa-feather-alt"></i>
      <p>請撥動上方時光大河，點擊年份以研讀賓翁生平</p>
    </div>
    
    <!-- 有选中年份时显示详情 -->
    <div v-else class="detail-content">
      <!-- 顶部: 年份标题 + 模式切换 -->
      <div class="detail-header-ya">
        <div class="year-title">公元 {{ bucket.year }} 年</div>
        
        <!-- 摘要/史料模式切换开关 -->
        <div class="study-mode-toggle">
          <!-- 摘要模式按钮 -->
          <span :class="{ active: !studyMode }" @click="studyMode = false">
            敘事摘要
          </span>
          
          <!-- 开关 -->
          <div class="toggle-switch" @click="studyMode = !studyMode">
            <div class="switch-ball" :class="{ right: studyMode }"></div>
          </div>
          
          <!-- 史料模式按钮 -->
          <span :class="{ active: studyMode }" @click="studyMode = true">
            史料研讀
          </span>
        </div>
      </div>

      <!-- 主体: 主题内容区域 -->
      <!-- 
        key 属性: currentPage + '-' + bucket?.year
        作用: 切换年份或翻页时强制重新渲染
      -->
      <div v-if="currentTheme" class="theme-page" :key="currentPage + '-' + bucket?.year">
        
        <!-- 主题标题行 -->
        <div class="theme-header-row">
          <!-- 主题标签 (彩色边框) -->
          <div class="theme-banner" :style="{ color: currentTheme.color }">
            <span class="theme-label-vertical">{{ currentTheme.label }}</span>
          </div>
          
          <!-- 悬浮翻页器 (只有超过1页时显示) -->
          <div v-if="totalPages > 1" class="page-nav">
            <button class="page-btn" 
                    @click="currentPage = Math.max(0, currentPage - 1)" 
                    :disabled="currentPage === 0">‹</button>
            <span class="page-text">{{ currentPage + 1 }}/{{ totalPages }}</span>
            <button class="page-btn" 
                    @click="currentPage = Math.min(totalPages - 1, currentPage + 1)" 
                    :disabled="currentPage === totalPages - 1">›</button>
          </div>
        </div>
        
        <!-- 事件列表 (可滚动) -->
        <div class="events-list custom-scrollbar" :key="currentPage">
          <!-- 
            v-for 遍历当前主题的事件
            studyMode 控制显示摘要还是详情
          -->
          <div v-for="ev in currentTheme.events" 
               :key="ev.id" 
               class="ya-event-card" 
               :class="{ 'study-view': studyMode }">
            
            <!-- 左侧: 地点印章 (竖排) -->
            <div class="card-left">
              <div class="loc-stamp">{{ ev.location || '游蹤' }}</div>
            </div>
            
            <!-- 右侧: 事件内容 -->
            <div class="card-right">
              <!-- 日期 -->
              <div class="ev-date">{{ ev.rawDate }}</div>
              
              <!-- 文本内容 -->
              <div class="ev-text">
                <!-- 史料模式: 显示完整详情 -->
                <template v-if="studyMode">
                  <div class="details-full">{{ ev.details }}</div>
                </template>
                
                <!-- 摘要模式: 显示摘要 -->
                <template v-else>
                  <div class="summary-line">{{ ev.summary }}</div>
                </template>
              </div>
              
              <!-- 艺术品标签 -->
              <div v-if="ev.artifacts && ev.artifacts.length" class="ev-artifacts">
                <span v-for="art in ev.artifacts" :key="art" class="art-tag">
                  # {{ art }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * YearDetailPanel 组件
 * 
 * 功能:
 * - 显示选中年份的事件详情
 * - 按主题分页 (翻页器)
 * - 切换摘要/史料模式
 */

import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'YearDetailPanel',
  
  // 接收父组件的属性
  props: {
    // 年份桶数据 (包含该年所有事件)
    bucket: Object,
    // 主题过滤数组
    selectedThemes: Array
  },
  
  data() {
    return {
      // false = 摘要模式, true = 史料模式
      studyMode: false,
      // 当前翻页页码 (从0开始)
      currentPage: 0
    };
  },
  
  computed: {
    /**
     * 过滤后的事件列表
     * 根据 selectedThemes 过滤
     */
    filteredEvents() {
      if (!this.bucket) return [];
      
      // 如果没有主题过滤，返回全部
      if (!this.selectedThemes.length) return this.bucket.events;
      
      // 过滤出包含选中主题的事件
      return this.bucket.events.filter(ev => 
        ev.themes.some(t => this.selectedThemes.includes(t))
      );
    },
    
    /**
     * 主题分组
     * 将事件按主题分类，每组一个"页面"
     * 
     * 结构: [{ id, label, color, events: [...] }, ...]
     */
    themeGroups() {
      if (!this.bucket) return [];
      
      const groups = [];
      
      // 确定需要显示的主题ID列表
      const activeIds = this.selectedThemes.length > 0 
        ? this.selectedThemes 
        : CHRONOLOGY_THEMES.map(t => t.id);
      
      // 按主题ID分组
      activeIds.forEach(id => {
        const meta = CHRONOLOGY_THEMES.find(t => t.id === id);
        const evs = this.filteredEvents.filter(ev => ev.themes.includes(id));
        if (evs.length) {
          groups.push({ ...meta, events: evs });
        }
      });
      
      return groups;
    },
    
    /**
     * 当前显示的主题 (当前页)
     */
    currentTheme() {
      return this.themeGroups[this.currentPage] || null;
    },
    
    /**
     * 总页数
     */
    totalPages() {
      return this.themeGroups.length;
    }
  },
  
  /**
   * 监听 bucket 变化
   * 切换年份时重置翻页到第一页
   */
  watch: {
    bucket() {
      this.currentPage = 0;
    }
  }
};
</script>

<style scoped>
/* ========== 容器样式 ========== */

/* 最外层 */
.year-detail-outer {
  height: 100%;
  width: 100%;
  background: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 详情内容 */
.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 无数据占位 */
.placeholder-ya {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8b7d6b;
  font-family: "KaiTi", serif;
  font-size: 18px;
  opacity: 0.6;
}

/* ========== 顶部标题栏 ========== */

.detail-header-ya {
  flex-shrink: 0;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(244, 239, 223, 0.9);
  border-bottom: 1px solid #d2b48c;
}

/* 年份标题 */
.year-title {
  font-family: "KaiTi", serif;
  font-size: 24px;
  font-weight: bold;
  color: #5c4033;
}

/* 模式切换 */
.study-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-family: "KaiTi", serif;
  color: #8b7d6b;
  cursor: pointer;
}

.study-mode-toggle span.active { 
  color: #c0392b; 
  font-weight: bold; 
}

/* 开关 */
.toggle-switch {
  width: 40px;
  height: 20px;
  background: #d2b48c;
  border-radius: 10px;
  position: relative;
}

/* 开关圆球 */
.switch-ball {
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: 0.3s;
}

/* 开关圆球 - 右侧 (史料模式) */
.switch-ball.right { 
  left: 22px; 
  background: #c0392b; 
}

/* ========== 主题内容区域 ========== */

.theme-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  overflow: hidden;
}

/* 主题标题行 */
.theme-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

/* 主题标签 */
.theme-banner {
  border-left: 4px solid currentColor;
  padding-left: 10px;
}

/* ========== 翻页器 ========== */

.page-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid #d2b48c;
}

.page-text {
  font-family: "Georgia", serif;
  font-size: 13px;
  color: #8b7d6b;
  min-width: 30px;
  text-align: center;
}

.page-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-size: 16px;
  color: #5c4033;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #c0392b;
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ========== 事件列表 ========== */

.events-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
}

/* 事件卡片 */
.ya-event-card {
  background: #fff;
  border: 1px solid #d2b48c;
  padding: 12px;
  display: flex;
  gap: 12px;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.05);
}

/* 地点印章 */
.loc-stamp {
  writing-mode: vertical-rl;
  border: 1.5px solid #c0392b;
  color: #c0392b;
  padding: 5px 2px;
  font-family: "KaiTi", serif;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 2px;
}

/* 右侧内容 */
.card-right { 
  flex: 1; 
}

/* 日期 */
.ev-date { 
  font-size: 12px; 
  color: #8b7d6b; 
  font-family: "Georgia"; 
  margin-bottom: 5px; 
}

/* 摘要文字 */
.summary-line { 
  font-size: 15px; 
  line-height: 1.6; 
  color: #3d2b1f; 
}

/* 详情文字 */
.details-full { 
  font-size: 14px; 
  line-height: 1.8; 
  color: #5c4033; 
  text-align: justify; 
  white-space: pre-wrap; 
}

/* 艺术品标签 */
.art-tag {
  display: inline-block;
  font-size: 11px;
  color: #c0392b;
  background: rgba(192, 57, 43, 0.05);
  padding: 2px 8px;
  margin-right: 5px;
  margin-top: 8px;
  border-radius: 10px;
}

/* 滚动条 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { 
  background: #d2b48c; 
  border-radius: 10px; 
}
</style>
