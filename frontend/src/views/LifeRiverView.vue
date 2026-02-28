<template>
  <div class="life-river-wrapper">
    <div v-if="loading" class="loading-state">
      正在載入編年數據……
    </div>
    <div v-else class="river-layout-root">
      <!-- 左側：長卷區 -->
      <div class="river-left-pane">
        <div class="river-scroll-box" ref="scrollContainer" @wheel.prevent="onWheel">
          <!-- 核心內容：寬 3200px，高 500px 的實體區塊 -->
          <div class="river-canvas-entity">
            <RiverChart
              :buckets="yearBuckets"
              :selected-themes="selectedThemes"
              :selected-year="selectedYear"
              @select-year="onSelectYear"
            />
          </div>
        </div>
        <!-- 底部圖例 -->
        <div class="river-footer-legend">
          <ThemeFilterBar
            :themes="themes"
            v-model="selectedThemes"
          />
        </div>
      </div>

      <!-- 右側：詳情區 (固定 320px) -->
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
      return this.selectedYear ? (this.yearBuckets.find(b => b.year === this.selectedYear) || null) : null;
    }
  },
  async mounted() {
    try {
      const res = await fetch('/data/chronology_full.csv');
      const text = await res.text();
      const rows = parseCsv(text);
      const events = rows.map((row) => {
        const { year, month, day } = parseDateToYMD(row.Exact_Date);
        const ev = {
          id: row.Event_ID, year, month, day,
          rawDate: row.Exact_Date,
          location: row.Master_Location || null,
          action: row.Subject_Action || '',
          summary: row.Summary_Text || '',
          details: row.Details_Evidence || '',
          artifacts: (row.Artifact_Refs || '').split(/[;，,]/).map(s => s.trim()).filter(Boolean),
          socialWeight: parseInt(row.Social_Weight, 10) || 0
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
    onSelectYear(year) { this.selectedYear = year; },
    onWheel(e) {
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.scrollLeft += e.deltaY;
      }
    }
  }
};
</script>

<style scoped>
.life-river-wrapper {
  width: 100vw; height: 100vh; background: #fffef9;
  padding-top: 60px; overflow: hidden;
}

.river-layout-root {
  display: flex; width: 100%; height: calc(100vh - 60px);
}

.river-left-pane {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
}

.river-scroll-box {
  flex: 1;
  overflow-x: auto; /* 回歸原生滾動 */
  overflow-y: hidden;
  display: flex;
  align-items: center; /* 大河垂直居中 */
  background: #fffef9;
}

.river-canvas-entity {
  width: 3200px;
  height: 500px; /* 給予確定物理高度 */
  flex-shrink: 0;
}

.river-footer-legend {
  height: 60px; background: #fffef9;
  border-top: 1px solid rgba(139, 69, 19, 0.1);
  display: flex; align-items: center; justify-content: center;
}

.river-right-detail {
  width: 320px; flex-shrink: 0;
  background: #fdf5e6; border-left: 1px solid #d2b48c;
}

.loading-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: "KaiTi", serif; font-size: 24px; color: #5c4033;
}
</style>
