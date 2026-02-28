<template>
  <div class="life-river-wrapper">
    <!-- 移除 redundant title-bar，與全局 Navbar 對接 -->
    <div v-if="loading" class="loading-state">
      <div class="ink-loader"></div>
      正在載入編年數據……
    </div>
    <div v-else class="river-main-content">
      <RiverChart
        :buckets="yearBuckets"
        :selected-themes="selectedThemes"
        :selected-year="selectedYear"
        @select-year="onSelectYear"
      />

      <YearDetailPanel
        :bucket="currentBucket"
        :selected-themes="selectedThemes"
      />

      <ThemeFilterBar
        :themes="themes"
        v-model="selectedThemes"
      />
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
      // 修正數據源為 Master CSV
      const res = await fetch('/data/HBH_Full_Chronology_Master.csv');
      const text = await res.text();
      const rows = parseCsv(text);
      const events = rows.map((row) => {
        const { year, month, day } = parseDateToYMD(row.Exact_Date);
        const socialWeight = parseInt(row.Social_Weight, 10);
        const artifacts = (row.Artifact_Refs || '')
          .split(/[;，,]/)
          .map((s) => s.trim())
          .filter(Boolean);
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
          artifacts,
          socialWeight: Number.isNaN(socialWeight) ? 0 : socialWeight
        };
        ev.themes = assignThemes(ev);
        return ev;
      }).filter((ev) => Number.isFinite(ev.year));

      this.events = events;
      this.yearBuckets = buildYearBuckets(events);
      console.log('Life River Buckets Built:', this.yearBuckets.length);
      
      if (this.yearBuckets.length) {
        this.selectedYear = this.yearBuckets[this.yearBuckets.length - 1].year;
      }
      this.loading = false;
    } catch (e) {
      console.error('CRITICAL: Failed to load or parse Master CSV', e);
    }
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
  height: 100vh;
  background: #fdf5e6;
  display: flex;
  flex-direction: column;
  padding-top: 80px; /* 為全局 Navbar 留位 */
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
  width: 50px;
  height: 50px;
  border: 3px solid #5c4033;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.river-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
