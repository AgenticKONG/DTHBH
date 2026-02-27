<template>
  <div class="life-river-wrapper">
    <div class="header-spacer"></div>

    <div class="title-bar">
      <div class="title-main">黄宾虹生平大河</div>
      <div class="title-sub">基于年谱数据的宏观时间叙事</div>
    </div>

    <div v-if="loading" class="loading-state">
      正在载入年谱数据……
    </div>
    <div v-else>
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
      const res = await fetch('/data/chronology_full.csv');
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
      if (this.yearBuckets.length) {
        this.selectedYear = this.yearBuckets[0].year;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load chronology_full.csv', e);
    } finally {
      this.loading = false;
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
  width: 100%;
  min-height: 100vh;
  background-image: url('@/assets/images/timeline.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 0 40px 24px;
  box-sizing: border-box;
}

.header-spacer {
  height: 72px;
}

.title-bar {
  margin-bottom: 12px;
}

.title-main {
  font-size: 24px;
  letter-spacing: 4px;
  color: #3b2a18;
}

.title-sub {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.loading-state {
  padding: 24px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}
</style>

