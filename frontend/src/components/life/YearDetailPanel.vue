<template>
  <div class="year-detail-panel">
    <div v-if="!bucket" class="placeholder">
      请选择上方时间轴中的某一年，查看该年的生平事件。
    </div>
    <div v-else>
      <div class="year-header">
        <div class="year-main">{{ bucket.year }} 年</div>
        <div class="year-meta">
          <span>事件数：{{ filteredEvents.length }}</span>
        </div>
      </div>

      <div v-if="!filteredEvents.length" class="placeholder">
        当前主题下该年暂无匹配事件，可尝试切换主题或取消筛选。
      </div>

      <div v-else class="themes-grid">
        <div
          v-for="theme in themeGroups"
          :key="theme.id"
          class="theme-column"
        >
          <div class="theme-title" :style="{ borderColor: theme.color }">
            <span class="title-text">{{ theme.label }}</span>
          </div>

          <div
            v-for="ev in theme.events"
            :key="ev.id"
            class="event-card"
          >
            <div class="event-stamp">
              <div class="stamp-text">{{ ev.location || '未知地点' }}</div>
            </div>
            <div class="event-body">
              <div class="event-main">{{ ev.summary }}</div>
              <div class="event-meta">
                <span v-if="ev.rawDate" class="tag">{{ ev.rawDate }}</span>
                <span v-if="ev.action" class="tag">{{ ev.action }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';

export default {
  name: 'YearDetailPanel',
  props: {
    bucket: {
      type: Object,
      default: null
    },
    selectedThemes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    filteredEvents() {
      if (!this.bucket) return [];
      if (!this.selectedThemes.length) return this.bucket.events;
      return this.bucket.events.filter((ev) =>
        (ev.themes || []).some((id) => this.selectedThemes.includes(id))
      );
    },
    themeGroups() {
      if (!this.bucket) return [];
      const groups = new Map();
      const activeThemeIds = this.selectedThemes.length
        ? this.selectedThemes
        : CHRONOLOGY_THEMES.map((t) => t.id);

      activeThemeIds.forEach((id) => {
        const meta = CHRONOLOGY_THEMES.find((t) => t.id === id);
        if (!meta) return;
        groups.set(id, { id, label: meta.label, color: meta.color, events: [] });
      });

      this.filteredEvents.forEach((ev) => {
        (ev.themes || []).forEach((id) => {
          if (!groups.has(id)) return;
          groups.get(id).events.push(ev);
        });
      });

      return Array.from(groups.values()).filter((g) => g.events.length);
    }
  }
};
</script>

<style scoped>
.year-detail-panel {
  padding: 12px 24px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.placeholder {
  padding: 16px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.year-main {
  font-size: 18px;
  font-weight: 600;
  color: #4a341d;
}

.year-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

.themes-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.theme-column {
  min-width: 220px;
  flex: 1 1 0;
}

.theme-title {
  border-left: 3px solid #8e682f;
  padding-left: 8px;
  margin-bottom: 6px;
}

.title-text {
  font-size: 13px;
  color: #5a3f21;
  letter-spacing: 2px;
}

.event-card {
  display: flex;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(250, 248, 242, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.event-stamp {
  margin-right: 8px;
}

.stamp-text {
  border: 1px solid #c0392b;
  color: #c0392b;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}

.event-body {
  flex: 1;
}

.event-main {
  font-size: 13px;
  color: #3a2a15;
  line-height: 1.4;
  margin-bottom: 4px;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 1px 6px;
}
</style>

