<template>
  <div class="container-fluid">
    <!-- 1. 頂部留白 -->
    <div class="header-spacer"></div>

    <!-- 全局 SVG 定義 (濾鏡) -->
    <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
      <defs>
        <filter id="ink-spread-ya">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.07" numOctaves="4" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="diffused" />
          <feGaussianBlur in="diffused" stdDeviation="0.5" result="soft-edge" />
          <feComponentTransfer in="soft-edge"><feFuncA type="linear" slope="1.2" /></feComponentTransfer>
        </filter>
      </defs>
    </svg>

    <!-- 2. 雅致標籤頁 -->
    <div class="nav-tabs-ya">
      <div class="nav-tab-ya" :class="{ active: activeView === 'ink-sea-view' }" @click="activeView = 'ink-sea-view'">墨海星圖</div>
      <div class="nav-tab-ya" :class="{ active: activeView === 'soulmate-view' }" @click="activeView = 'soulmate-view'">知音對話</div>
      <div class="nav-tab-ya" :class="{ active: activeView === 'sichuan-view' }" @click="switchTab('sichuan-view')">蜀游長卷</div>
    </div>

    <div class="main-viewport">
      <!-- 1. 知音對話 (長卷視圖) -->
      <div v-if="activeView === 'soulmate-view'" class="view active">
        <SoulmateRibbon />
      </div>

      <!-- 2. 墨海星圖 (社交網絡) -->
      <div v-if="activeView === 'ink-sea-view'" class="view active">
        <InkSeaMap />
      </div>

      <!-- 3. 蜀游長卷 (入蜀紀程) -->
      <div v-if="activeView === 'sichuan-view'" class="view active sichuan-tour-container">
        <div class="sichuan-h-layout">
          <div class="tour-map-top" ref="mapViewport">
            <div class="map-label-ink">長江萬里圖 · 黃賓虹一九三二年入蜀紀程</div>
            <div class="map-camera" :style="cameraTransform">
              <svg id="sichuan-svg"></svg>
            </div>
          </div>
          
          <div class="story-track-h custom-scrollbar" ref="storyTrack" @scroll="handleTourScroll" @wheel.prevent="handleWheel">
            <div class="story-canvas-width">
              <div v-for="(step, index) in sichuanData" :key="index" class="story-node-h" :class="{ 'is-active': activeStep === index }">
                <div class="tiba-card-refined" @click="scrollToStep(index)">
                  <div class="tiba-stamp-red">{{ step.location }}</div>
                  <div class="tiba-body">
                    <div class="tiba-main-event">{{ step.description }}</div>
                    <div class="tiba-meta-row">
                      <span class="tiba-date-tag">{{ step.date }}</span>
                      <span class="tiba-title-sub">{{ step.title }}</span>
                    </div>
                    <div class="tiba-social-box">
                      <span class="social-label">與會：</span>
                      <span class="social-names">{{ step.social }}</span>
                    </div>
                  </div>
                  <div v-if="step.image" class="tiba-img-side" @click.stop="openAppreciation(step)">
                    <img :src="step.image" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="tour-ruler-final">
            <div v-for="(step, index) in sichuanData" :key="index" class="ruler-tick" :class="{ active: activeStep === index }" @click="scrollToStep(index)">
              <div class="tick-dot"></div>
              <div class="tick-label">{{ step.location }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 沉浸式鑒賞窗 -->
    <transition name="scroll-unroll">
      <div v-if="showAppreciation" class="appreciation-overlay" @click="closeAppreciation">
        <div class="appreciation-content" @click.stop>
          <div class="silk-mounting">
            <div class="painting-wrap">
              <img :src="selectedStep.image" class="full-painting" />
              <div class="scroll-axis top"></div>
              <div class="scroll-axis bottom"></div>
            </div>
            <div class="inscription-area">
              <div class="ins-title">{{ selectedStep.location }} · {{ selectedStep.title }}</div>
              <div class="ins-content">{{ selectedStep.description }}</div>
              <div class="ins-meta">一九三二年 · 賓虹紀遊</div>
              <div class="ins-seal"><span>黃賓</span><span>虹印</span></div>
            </div>
          </div>
          <div class="close-btn" @click="closeAppreciation">×</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import * as d3 from 'd3';
import InkSeaMap from '../components/InkSeaMap.vue';
import SoulmateRibbon from '../components/SoulmateRibbon.vue';

export default {
  name: 'FriendsNetwork',
  components: { InkSeaMap, SoulmateRibbon },
  data() {
    return {
      activeView: 'ink-sea-view',
      activeStep: 0,
      mapXOffset: 0,
      showAppreciation: false,
      selectedStep: {},
      sichuanData: [
        { "date": "09.15", "location": "上海", "title": "登輪啟程", "social": "宋若嬰", "description": "中秋佳節，賓公由十六鋪登永年輪啟程入蜀， 月光微輝，無限離情。", "image": "/images/huangbinhong.jpg", "x_pct": 0.95, "y_pct": 0.5 },
        { "date": "09.18", "location": "安慶", "title": "遙望九華", "social": "吳一峰", "description": "晨起遙望九華山吞吐白雲中，直是米氏潑墨， 感懷家山水色之秀。", "image": "/images/shanshui.jpg", "x_pct": 0.85, "y_pct": 0.4 },
        { "date": "09.22", "location": "宜昌", "title": "川江門戶", "social": "顏承基", "description": "江闊水深之終點，正式進入川江。見“酒船”奇 景，极其梦幻。", "image": "/images/shuimo.jpg", "x_pct": 0.75, "y_pct": 0.6 },
        { "date": "09.23", "location": "三峽", "title": "三峽奇險", "social": "江上縴夫", "description": "兩岸高峰限日，削壁阻流。縴夫涉水而渡， 賓公嘆：此非壯遊不足以增閱歷。", "image": "/images/painting1.jpg", "x_pct": 0.65, "y_pct": 0.45 },
        { "date": "09.24", "location": "夔府", "title": "夔門大觀", "social": "亮公遺蹟", "description": "入瞿唐峽，兩山對立如門。西望風箱峽，勢 極曲折，感悟造化之奇。", "image": "/images/qingshan.jpg", "x_pct": 0.55, "y_pct": 0.55 },
        { "date": "09.27", "location": "重慶", "title": "宿老古樓", "social": "王治易 / 羅希江", "description": "抵渝進城，宿老古樓川江旅社。連日賞鑒名人真蹟，確立‘筆墨第一’標准。", "image": "/images/xishan.jpg", "x_pct": 0.45, "y_pct": 0.4 },
        { "date": "10.13", "location": "犍為", "title": "狂瀾復挽", "social": "撐師", "description": "江流驟束，潛演回洑。石壁刻‘狂瀾復挽’四字， 且有鐵鏈懸焉，此為川江第一險。", "image": "/images/hushan.jpg", "x_pct": 0.35, "y_pct": 0.6 },
        { "date": "10.15", "location": "樂山", "title": "爾雅台", "social": "傳度 / 趙熙", "description": "登烏尤山，觀李龍眠羅漢卷。於爾雅台憑欄遙矚，暢談佛學畫理，悟得內美。", "image": "/images/lingu.jpg", "x_pct": 0.25, "y_pct": 0.5 },
        { "date": "10.22", "location": "峨眉", "title": "雪山感悟", "social": "背子工", "description": "坐‘背子’登山。悟得‘山水無定形’之理，畫風 轉向黑密厚重，積墨大成。", "image": "/images/xishanshengxiu.jpg", "x_pct": 0.15, "y_pct": 0.4 },
        { "date": "11.07", "location": "成都", "title": "少城盛宴", "social": "馮建吳 / 周稷", "description": "入蜀終點。於少城公園靜寧飯店宴請紳老及收藏家，入蜀所得悉數整理。", "image": "/images/qingcheng.jpg", "x_pct": 0.05, "y_pct": 0.5 }
      ]
    };
  },
  computed: {
    cameraTransform() { return { transform: `translateX(${-this.mapXOffset}px)` }; }
  },
  mounted() {
    if (this.activeView === 'sichuan-view') this.initSichuanTour();
  },
  methods: {
    switchTab(view) {
      this.activeView = view;
      if (view === 'sichuan-view') {
        this.$nextTick(() => {
          this.initSichuanTour();
          setTimeout(() => {
            const track = this.$refs.storyTrack;
            if (track) track.scrollLeft = track.scrollWidth;
          }, 50);
        });
      }
    },
    initSichuanTour() {
      const width = 3000, height = 220;
      const svg = d3.select('#sichuan-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();
      let meanderingPoints = [];
      for (let i = 0; i < this.sichuanData.length - 1; i++) {
        const p1 = this.sichuanData[i], p2 = this.sichuanData[i + 1];
        const x1 = p1.x_pct * width, y1 = p1.y_pct * height;
        const x2 = p2.x_pct * width, y2 = p2.y_pct * height;
        meanderingPoints.push([x1, y1]);
        for (let j = 1; j <= 3; j++) {
          const t = j / 4, x = x1 + (x2 - x1) * t;
          const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 25;
          meanderingPoints.push([x, y]);
        }
      }
      const last = this.sichuanData[this.sichuanData.length - 1];
      meanderingPoints.push([last.x_pct * width, last.y_pct * height]);
      const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));
      svg.append('path').attr('d', line(meanderingPoints)).attr('fill', 'none').attr('stroke', '#8b7d6b').attr('stroke-width', 50).attr('stroke-opacity', 0.08);
      this.tourPath = svg.append('path').attr('d', line(meanderingPoints)).attr('fill', 'none').attr('stroke', '#1a1a1a').attr('stroke-width', 3).attr('filter', 'url(#ink-spread-ya)');
      this.pathLen = this.tourPath.node().getTotalLength();
      this.tourPath.attr('stroke-dasharray', `${this.pathLen} ${this.pathLen}`).attr('stroke-dashoffset', this.pathLen);
      const nodes = svg.append('g').selectAll('g').data(this.sichuanData).enter().append('g');
      nodes.append('text').attr('x', d => d.x_pct * width).attr('y', d => d.y_pct * height - 20).attr('style', 'font-size: 13px; fill: #8b4513; font-weight: bold; opacity: 0.6; pointer-events: none;').attr('text-anchor', 'middle').text(d => d.location);
      nodes.append('rect').attr('x', d => d.x_pct * width - 6).attr('y', d => d.y_pct * height - 6).attr('width', 12).attr('height', 12).attr('fill', '#c0392b').attr('rx', 2).style('cursor', 'pointer').on('click', (e, d) => this.scrollToStep(this.sichuanData.indexOf(d)));
      this.brushTip = svg.append('circle').attr('r', 10).attr('fill', '#1a1a1a').style('opacity', 0);
    },
    handleWheel(e) { this.$refs.storyTrack.scrollLeft += e.deltaY * 1.2; },
    handleTourScroll(e) {
      if (!this.tourPath) return;
      const el = e.target, maxScroll = el.scrollWidth - el.clientWidth, scrollPercent = 1 - (el.scrollLeft / maxScroll);
      this.tourPath.attr('stroke-dashoffset', this.pathLen * (1 - scrollPercent));
      const point = this.tourPath.node().getPointAtLength(this.pathLen * scrollPercent);
      this.brushTip.attr('cx', point.x).attr('cy', point.y).style('opacity', 1);
      const viewportW = this.$refs.mapViewport.clientWidth;
      this.mapXOffset = Math.max(0, Math.min(3000 - viewportW, point.x - viewportW / 2));
      this.activeStep = Math.max(0, Math.min(this.sichuanData.length - 1, Math.floor(scrollPercent * this.sichuanData.length * 0.99)));
    },
    scrollToStep(index) {
      const track = this.$refs.storyTrack;
      const totalScroll = track.scrollWidth - track.clientWidth;
      const targetLeft = totalScroll * (1 - (index / (this.sichuanData.length - 1)));
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    },
    openAppreciation(step) { this.selectedStep = step; this.showAppreciation = true; },
    closeAppreciation() { this.showAppreciation = false; }
  }
};
</script>

<style scoped>
.container-fluid { height: 100vh; display: flex; flex-direction: column; background-color: #fdf5e6; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); overflow: hidden; color: #3d2b1f; font-family: "KaiTi", serif; }
.header-spacer { height: 80px; flex-shrink: 0; }
.nav-tabs-ya { display: flex; justify-content: center; padding: 10px 0; gap: 30px; background: rgba(244, 239, 223, 0.9); border-bottom: 1px solid #d2b48c; z-index: 100; }
.nav-tab-ya { padding: 6px 20px; cursor: pointer; border: 1px solid transparent; font-size: 14px; color: #8b7d6b; transition: 0.3s; border-radius: 4px; }
.nav-tab-ya.active { background: #c0392b; color: #fff; border-color: #c0392b; box-shadow: 2px 2px 8px rgba(192, 57, 43, 0.2); }
.main-viewport { flex: 1; overflow: hidden; position: relative; }
.view { display: none; height: 100%; position: relative; }
.view.active { display: block; }
.sichuan-h-layout { display: flex; flex-direction: column; height: 100%; }
.tour-map-top { height: 220px; background: #f4efdf; border-bottom: 1px solid #8b4513; overflow: hidden; position: relative; }
.map-label-ink { position: absolute; top: 12px; left: 20px; z-index: 10; font-size: 13px; color: #4a2e18; border: 1px solid #d2b48c; padding: 4px 12px; background: rgba(244,239,223,0.9); font-weight: bold; }
.story-track-h { flex: 1; overflow-x: scroll; overflow-y: hidden; padding: 20px 50px; scroll-behavior: smooth; }
.story-canvas-width { display: inline-flex; flex-direction: row-reverse; gap: 30px; }
.tiba-card-refined { background: #fff; border: 1px solid #d2b48c; border-left: 4px solid #c0392b; width: 420px; height: 180px; padding: 15px; display: flex; gap: 15px; cursor: pointer; }
.tiba-stamp-red { writing-mode: vertical-rl; background: #c0392b; color: #fff; padding: 8px 5px; font-size: 16px; font-weight: bold; text-align: center; }
.tiba-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.tiba-main-event { font-size: 15px; font-weight: bold; color: #1a1a1a; line-height: 1.4; }
.tiba-meta-row { display: flex; gap: 10px; font-size: 12px; color: #8b7d6b; }
.tiba-social-box { font-size: 12px; color: #8b4513; background: #fdf5e6; padding: 4px 10px; }
.tiba-img-side { width: 100px; height: 120px; border: 1px solid #eee; overflow: hidden; }
.tiba-img-side img { width: 100%; height: 100%; object-fit: cover; }
.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #8b4513; border-radius: 10px; }
.appreciation-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
.silk-mounting { background: #fdf5e6; padding: 40px; border: 1px solid #d2b48c; display: flex; gap: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
.painting-wrap { position: relative; max-height: 80vh; border: 4px solid #fff; }
.full-painting { max-height: 70vh; max-width: 50vw; object-fit: contain; }
.inscription-area { writing-mode: vertical-rl; padding: 20px; color: #1a1a1a; min-width: 150px; }
.ins-seal { margin-top: 30px; color: #c0392b; font-size: 20px; border: 2px solid #c0392b; padding: 5px; font-weight: bold; display: grid; grid-template-columns: 1fr 1fr; }
.tour-ruler-final { height: 40px; display: flex; flex-direction: row-reverse; justify-content: center; align-items: center; gap: 20px; background: #f4efdf; border-top: 1px solid #d2b48c; }
.ruler-tick { cursor: pointer; display: flex; flex-direction: column; align-items: center; opacity: 0.5; }
.ruler-tick.active { opacity: 1; }
.tick-dot { width: 6px; height: 6px; background: #8b4513; border-radius: 50%; }
.tick-label { font-size: 10px; color: #8b4513; margin-top: 4px; }
</style>
