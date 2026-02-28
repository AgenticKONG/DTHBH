<template>
  <div class="life-river-wrapper">
    <div v-if="loading" class="loading-state">
      <div class="ink-loader"></div>
      正在載入編年數據……
    </div>
    <div v-else class="river-main-content">
      <!-- 頂部視口：大河圖 + 懸浮工具條 -->
      <div class="river-viewport">
        <!-- 1. 懸浮工具條：絕對定位，不佔空間，不隨年份滾動 -->
        <div class="floating-toolbar">
          <ThemeFilterBar
            :themes="themes"
            v-model="selectedThemes"
          />
        </div>

        <!-- 2. 背景長卷：可橫向滾動 -->
        <RiverChart
          :buckets="yearBuckets"
          :selected-themes="selectedThemes"
          :selected-year="selectedYear"
          @select-year="onSelectYear"
        />
      </div>

      <!-- 底部詳情區：佔據絕對優勢空間 -->
      <div class="detail-viewport">
        <YearDetailPanel
          :bucket="currentBucket"
          :selected-themes="selectedThemes"
        />
      </div>
    </div>
  </div>
</template>

<script>
import RiverChart from '@/components/life/RiverChart.vue';
import ThemeFilterBar from '@/components/life/ThemeFilterBar.vue';
import YearDetailPanel from '@/components/life/YearDetailPanel.vue';
import { CHRONOLOGY_THEMES } from '@/config/chronologyThemes';
import { parseCsv, parseDateToYMD, assignThemes, buildYearBuckets } from '@/utils/chronology';

export default {
  name: 'LifeRiverView',
  components: {
    RiverChart,
    ThemeFilterBar,
    YearDetailPanel
  },
  data() {
    return {
      loading: true,
      events: [],
      yearBuckets: [],
      selectedYear: null,
      selectedThemes: [],
      themes: CHRONOLOGY_THEMES
    };
  },
  computed: {
    currentBucket() {
      if (!this.selectedYear) return null;
      return this.yearBuckets.find((b) => b.year === this.selectedYear) || null;
    }
  },
  async mounted() {
    try {
      const res = await fetch('/data/chronology_full.csv');
      const text = await res.text();
      const rows = parseCsv(text);
      const events = rows.map((row) => {
        const { year, month, day } = parseDateToYMD(row.Exact_Date);
        const socialWeight = parseInt(row.Social_Weight, 10);
        const ev = {
          id: row.Event_ID,
          year,
          month,
          day,
          rawDate: row.Exact_Date,
          location: row.Master_Location || null,
          action: row.Subject_Action || '',
          summary: row.Summary_Text || '',
          details: row.Details_Evidence || '',
          artifacts: (row.Artifact_Refs || '').split(/[;，,]/).map(s => s.trim()).filter(Boolean),
          socialWeight: isNaN(socialWeight) ? 0 : socialWeight
        };
        ev.themes = assignThemes(ev);
        return ev;
      }).filter(ev => !isNaN(ev.year));

      this.events = events;
      this.yearBuckets = buildYearBuckets(events);
      if (this.yearBuckets.length) this.selectedYear = 1864;
      this.loading = false;
    } catch (e) { console.error(e); }
  },
  methods: {
    onSelectYear(year) {
      this.selectedYear = year;
    }
  }
};
</script>

<style scoped>
.life-river-wrapper {
  width: 100vw;
  height: 100vh;
  background: #fdf5e6;
  display: flex;
  flex-direction: column;
  padding-top: 60px; /* Navbar space */
  overflow: hidden;
  box-sizing: border-box;
}

.river-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

/* 大河圖視口區域 */
.river-viewport {
  position: relative;
  height: 320px; /* 再次精簡高度 */
  flex-shrink: 0;
  border-bottom: 1.5px solid #d2b48c;
  background: #fffef9;
}

/* 真正的懸浮工具條 */
.floating-toolbar {
  position: absolute;
  top: 15px; /* 懸浮在大河上方 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 40px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  padding: 2px 15px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  pointer-events: auto; /* 確保可以點擊標籤 */
}

/* 下方詳情區：佔據最大空間 */
.detail-viewport {
  flex: 1;
  height: 0; /* 鎖定填充 */
  overflow: hidden;
}

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

.ink-loader {
  width: 40px;
  height: 40px;
  border: 3px solid #5c4033;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
