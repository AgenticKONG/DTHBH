<template>
  <div class="year-detail-outer custom-scrollbar">
    <div v-if="!bucket" class="placeholder-ya">
      <i class="fas fa-feather-alt"></i>
      <p>請撥動上方時光大河，點擊年份以研讀賓翁生平</p>
    </div>
    
    <div v-else class="detail-content">
      <div class="detail-header-ya">
        <div class="year-title">公元 {{ bucket.year }} 年</div>
        <div class="study-mode-toggle">
          <span :class="{ active: !studyMode }" @click="studyMode = false">敘事摘要</span>
          <div class="toggle-switch" @click="studyMode = !studyMode">
            <div class="switch-ball" :class="{ right: studyMode }"></div>
          </div>
          <span :class="{ active: studyMode }" @click="studyMode = true">史料研讀</span>
        </div>
      </div>

      <div class="themes-scroll-container custom-scrollbar">
        <div v-for="theme in themeGroups" :key="theme.id" class="theme-column">
          <div class="theme-banner" :style="{ color: theme.color }">
            <span class="theme-label-vertical">{{ theme.label }}</span>
          </div>

          <div v-for="ev in theme.events" :key="ev.id" class="ya-event-card" :class="{ 'study-view': studyMode }">
            <div class="card-left">
              <div class="loc-stamp">{{ ev.location || '游蹤' }}</div>
            </div>
            <div class="card-right">
              <div class="ev-date">{{ ev.rawDate }}</div>
              <div class="ev-text">
                <template v-if="studyMode">
                  <div class="details-full">{{ ev.details }}</div>
                </template>
                <template v-else>
                  <div class="summary-line">{{ ev.summary }}</div>
                </template>
              </div>
              <div v-if="ev.artifacts && ev.artifacts.length" class="ev-artifacts">
                <span v-for="art in ev.artifacts" :key="art" class="art-tag"># {{ art }}</span>
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
    bucket: Object,
    selectedThemes: Array
  },
  data() {
    return {
      studyMode: false
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
        if (evs.length) {
          groups.push({ ...meta, events: evs });
        }
      });
      return groups;
    }
  }
};
</script>

<style scoped>
.year-detail-outer {
  flex: 1;
  background: #fdf5e6;
  background-image: url('https://www.transparenttextures.com/patterns/parchment.png');
  border-top: 2px solid #d2b48c;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

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

.placeholder-ya i { font-size: 40px; margin-bottom: 15px; }

.detail-header-ya {
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(244, 239, 223, 0.8);
  border-bottom: 1px solid #d2b48c;
}

.year-title {
  font-family: "KaiTi", serif;
  font-size: 24px;
  font-weight: bold;
  color: #5c4033;
}

.study-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-family: "KaiTi", serif;
  color: #8b7d6b;
  cursor: pointer;
}

.study-mode-toggle span.active { color: #c0392b; font-weight: bold; }

.toggle-switch {
  width: 40px;
  height: 20px;
  background: #d2b48c;
  border-radius: 10px;
  position: relative;
  transition: 0.3s;
}

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

.switch-ball.right { left: 22px; background: #c0392b; }

.themes-scroll-container {
  display: flex;
  padding: 20px 40px;
  gap: 30px;
  overflow-x: auto;
}

.theme-column {
  min-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.theme-banner {
  border-left: 4px solid currentColor;
  padding-left: 10px;
  margin-bottom: 10px;
}

.theme-label-vertical {
  font-family: "KaiTi", serif;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 4px;
}

.ya-event-card {
  background: #fff;
  border: 1px solid #d2b48c;
  padding: 15px;
  display: flex;
  gap: 15px;
  transition: 0.3s;
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.05);
}

.ya-event-card:hover { transform: translateY(-3px); box-shadow: 5px 5px 15px rgba(0,0,0,0.1); }

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

.card-right { flex: 1; }
.ev-date { font-size: 12px; color: #8b7d6b; font-family: "Georgia"; margin-bottom: 5px; }
.summary-line { font-size: 15px; line-height: 1.6; color: #3d2b1f; }
.details-full { font-size: 14px; line-height: 1.8; color: #5c4033; text-align: justify; white-space: pre-wrap; }

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

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d2b48c; border-radius: 10px; }
</style>
