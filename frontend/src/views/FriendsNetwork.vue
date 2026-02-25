<template>
  <div class="container">
    <h1>黄宾虹交友网络</h1>

    <p class="intro">探索黄宾虹的交友网络与关键好友的时间轴，感受一代宗师的时空轨迹</p>

    <!-- 全局隐藏定义区：确保滤镜在任何标签页都可用 -->
    <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true" focusable="false">
      <defs>
        <filter id="ink-spread-global">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>

    <!-- 顶部 tab -->
    <div class="nav-tabs">
      <div class="nav-tab" :class="{ active: activeView === 'overview-view' }" @click="switchTab('overview-view')">
        交友网络
      </div>
      <div class="nav-tab" :class="{ active: activeView === 'sichuan-view' }" @click="switchTab('sichuan-view')">
        1932 蜀游专题
      </div>
      <div class="nav-tab" :class="{ active: activeView === 'timeline-view' }" @click="switchTab('timeline-view')">
        关键好友时间轴
      </div>
    </div>

    <!-- 1. 交友网络总览 -->
    <div id="overview-view" class="view" :class="{ active: activeView === 'overview-view' }">
      <svg id="overview-svg"></svg>
    </div>

    <!-- 2. 蜀游专题视图 -->
    <div id="sichuan-view" class="view sichuan-tour-container" :class="{ active: activeView === 'sichuan-view' }">
      <div class="sichuan-layout">
        <!-- 左侧：固定动线 -->
        <div class="tour-canvas-fixed">
          <div class="map-label">1932 賓公入蜀寫生圖</div>
          <svg id="sichuan-svg" style="background: #f4efdf;"></svg>
        </div>
        <!-- 右侧：叙事卡片 -->
        <div class="story-track" ref="storyTrack" @scroll="handleTourScroll">
          <div v-for="(step, index) in sichuanData" :key="index" 
               class="story-node" 
               :class="{ 'is-active': activeStep === index }">
            <div class="story-card" @click="scrollToStep(index)">
              <div class="card-header">
                <span class="story-date">{{ step.date }}</span>
                <span class="story-location">{{ step.location }}</span>
              </div>
              <div class="card-body">
                <div class="text-content">
                  <div class="story-title">{{ step.title }}</div>
                  <div class="story-desc">{{ step.description }}</div>
                </div>
                <div v-if="step.image" class="thumb-image-wrap">
                  <img :src="step.image" class="thumb-image" />
                </div>
              </div>
              <div v-if="step.diary" class="diary-section">
                <button class="scroll-toggle" @click.stop="toggleDiary(index)">
                  {{ step.showDiary ? '收起卷軸' : '閱覽日記原文' }}
                </button>
                <transition name="scroll-unfold">
                  <div v-if="step.showDiary" class="diary-scroll">
                    <div class="diary-content">{{ step.diary }}</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
          <div style="height: 300px;"></div>
        </div>
      </div>
    </div>

    <!-- 3. 时间轴视图 -->
    <div id="timeline-view" class="view" :class="{ active: activeView === 'timeline-view' }">
      <div class="timeline-container">
        <svg id="timeline-svg"></svg>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { getDataStore } from '@/stores/dataStore';

export default {
  name: 'JiaoyouIndex',
  data() {
    return {
      activeView: 'overview-view',
      activeStep: 0,
      storyNodes: [],
      sichuanData: [
        { "date": "09.15", "location": "上海", "title": "登輪啟程", "description": "午夜月光微輝，三人同行入蜀。", "image": "/images/huangbinhong.jpg", "diary": "九月十五日，下午登永年輪。午夜月光微輝，似含無限之離情。", "showDiary": false, "x": 0.15, "y": 0.1 },
        { "date": "09.18", "location": "安慶", "title": "遙望九華", "description": "遠眺山色，如米氏潑墨。", "image": "/images/shanshui.jpg", "diary": "十八日晨，遙望九華山吞吐白雲中，直是米氏潑墨。", "showDiary": false, "x": 0.35, "y": 0.22 },
        { "date": "09.22", "location": "宜昌", "title": "初入川江", "description": "見“酒船”奇景，極其夢幻。", "image": "/images/shuimo.jpg", "diary": "舟至宜昌泊，內有酒麵可以餉客，呼之為酒船。", "showDiary": false, "x": 0.55, "y": 0.35 },
        { "date": "09.23", "location": "西陵峽", "title": "三峽奇險", "description": "兩岸高峰限日，削壁阻流。", "image": "/images/painting1.jpg", "diary": "入西陵峽，水勢飛越，膽股為之掉栗。", "showDiary": false, "x": 0.7, "y": 0.45 },
        { "date": "09.24", "location": "夔府", "title": "夔門大觀", "description": "兩山對立如門，江面奇狹。", "image": "/images/qingshan.jpg", "diary": "二十四日，至白帝城，川江三峽此段為最壯觀。", "showDiary": false, "x": 0.85, "y": 0.55 },
        { "date": "09.27", "location": "重慶", "title": "宿老古樓", "description": "賞鑒名人真蹟，確立標準。", "image": "/images/xishan.jpg", "diary": "抵渝進城，宿老古樓川江旅社。晚間賞鑒古銅瓷器。", "showDiary": false, "x": 0.75, "y": 0.65 },
        { "date": "10.13", "location": "犍為", "title": "狂瀾復挽", "description": "江流驟束，鐵鏈橫江。", "image": "/images/hushan.jpg", "diary": "到死關，江流驟束，石壁刻‘狂瀾復挽’四字。", "showDiary": false, "x": 0.55, "y": 0.75 },
        { "date": "10.15", "location": "樂山", "title": "爾雅台", "description": "暢談佛學畫理，悟得內美。", "image": "/images/lingu.jpg", "diary": "登爾雅台，憑欄遙矚。傳度出示李龍眠羅漢卷。", "showDiary": false, "x": 0.35, "y": 0.82 },
        { "date": "10.22", "location": "峨眉", "title": "雪山感悟", "description": "悟得山水無定形，畫風大變。", "image": "/images/xishanshengxiu.jpg", "diary": "五里洗象池，樹木四月發葉，九月下雪，金頂六月烤火。", "showDiary": false, "x": 0.15, "y": 0.9 },
        { "date": "11.07", "location": "成都", "title": "少城盛宴", "description": "宴請紳老，整理入蜀所得。", "image": "/images/qingcheng.jpg", "diary": "晚間應老同學馮建吳之宴於少城公園之靜寧飯店。", "showDiary": false, "x": 0.3, "y": 0.95 }
      ],
      data: { locations: [] }
    };
  },

  methods: {
    switchTab(view) {
      this.activeView = view;
      this.$nextTick(() => {
        if (view === 'overview-view') this.initOverview();
        if (view === 'sichuan-view') this.initSichuanTour();
      });
    },

    initSichuanTour() {
      const container = document.querySelector('.tour-canvas-fixed');
      if (!container) return;
      const svg = d3.select('#sichuan-svg');
      const width = container.clientWidth;
      const height = container.clientHeight;
      svg.attr('width', width).attr('height', height).selectAll('*').remove();

      const pathData = this.sichuanData.map(d => [d.x * width, d.y * height]);
      const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));

      // 1. 底图层：地名标注
      const bg = svg.append('g');
      bg.selectAll('text').data(this.sichuanData).enter().append('text')
        .attr('x', d => d.x * width + 12).attr('y', d => d.y * height + 4)
        .attr('style', 'font-size: 12px; fill: #8b4513; opacity: 0.5;')
        .text(d => d.location);

      // 2. 路径层：显式内联 fill="none"
      bg.append('path')
        .attr('d', line(pathData))
        .attr('fill', 'none')
        .attr('stroke', '#8b7d6b')
        .attr('stroke-width', 6)
        .attr('stroke-opacity', 0.1);

      this.tourPath = svg.append('path')
        .attr('d', line(pathData))
        .attr('fill', 'none')
        .attr('stroke', '#1a1a1a')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('filter', 'url(#ink-spread-global)');

      const totalLength = this.tourPath.node().getTotalLength();
      this.tourPath.attr('stroke-dasharray', `${totalLength} ${totalLength}`).attr('stroke-dashoffset', totalLength);

      // 3. 节点
      svg.selectAll('circle.node').data(this.sichuanData).enter().append('circle')
        .attr('cx', d => d.x * width).attr('cy', d => d.y * height)
        .attr('r', 5).attr('fill', '#c0392b')
        .style('cursor', 'pointer')
        .on('click', (e, d) => this.scrollToStep(this.sichuanData.indexOf(d)));

      this.brushTip = svg.append('circle').attr('r', 8).attr('fill', '#1a1a1a').attr('filter', 'url(#ink-spread-global)').style('opacity', 0);
    },

    handleTourScroll(e) {
      const el = e.target;
      const scrollPercent = el.scrollTop / (el.scrollHeight - el.clientHeight);
      if (this.tourPath) {
        const totalLength = this.tourPath.node().getTotalLength();
        this.tourPath.attr('stroke-dashoffset', totalLength * (1 - scrollPercent));
        const point = this.tourPath.node().getPointAtLength(totalLength * scrollPercent);
        this.brushTip.attr('cx', point.x).attr('cy', point.y).style('opacity', 1);
      }
      this.activeStep = Math.min(this.sichuanData.length - 1, Math.floor((el.scrollTop + 150) / 320));
    },

    scrollToStep(index) {
      const target = this.$refs.storyTrack.querySelectorAll('.story-node')[index];
      if (target) this.$refs.storyTrack.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
    },

    toggleDiary(index) { this.sichuanData[index].showDiary = !this.sichuanData[index].showDiary; },
    initOverview() { /* 快速总览绘制 */
      const container = document.getElementById('overview-view');
      const width = container.clientWidth, height = container.clientHeight;
      const svg = d3.select('#overview-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();
      svg.append('text').attr('x', width/2).attr('y', height/2).text('请切换到蜀游专题查看深度优化').attr('text-anchor', 'middle');
    }
  }
};
</script>

<style scoped>
  .container { max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8f4e6; min-height: 100vh; font-family: "Kai Ti", serif; }
  h1 { text-align: center; color: #4a2e18; }
  .intro { text-align: center; color: #8b7d6b; margin-bottom: 20px; }
  
  .nav-tabs { display: flex; justify-content: center; margin-bottom: 15px; }
  .nav-tab { padding: 8px 20px; cursor: pointer; border: 1px solid #d2b48c; margin: 0 5px; border-radius: 4px; background: #eee; }
  .nav-tab.active { background: #fff; border-bottom: 2px solid #c0392b; font-weight: bold; }

  .view { height: 600px; border: 1px solid #d2b48c; background: #fffbf0; position: relative; display: none; }
  .view.active { display: block; }

  /* 蜀游专题关键修复 */
  .sichuan-tour-container.active { display: flex !important; }
  .sichuan-layout { display: flex; width: 100%; height: 100%; overflow: hidden; }
  .tour-canvas-fixed { width: 400px; height: 100%; border-right: 1px solid #d2b48c; background: #f4efdf; position: relative; }
  .map-label { position: absolute; top: 15px; left: 15px; font-size: 16px; color: #8b4513; opacity: 0.7; border-left: 3px solid #c0392b; padding-left: 8px; }
  
  .story-track { flex: 1; overflow-y: scroll; padding: 20px; scroll-behavior: smooth; }
  .story-node { min-height: 320px; display: flex; align-items: center; opacity: 0.3; transition: 0.5s; }
  .story-node.is-active { opacity: 1; }
  
  .story-card { background: #fff; padding: 15px; border: 1px solid #d2b48c; border-radius: 4px; width: 100%; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; border-bottom: 1px solid #f4efdf; margin-bottom: 10px; padding-bottom: 5px; }
  .story-date { color: #c0392b; font-weight: bold; }
  .story-location { color: #8b4513; font-style: italic; }
  
  .card-body { display: flex; gap: 15px; }
  .text-content { flex: 1; }
  .story-title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
  .story-desc { font-size: 14px; color: #666; line-height: 1.6; }
  
  .thumb-image-wrap { width: 100px; height: 70px; border: 1px solid #eee; overflow: hidden; }
  .thumb-image { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.3); }

  .diary-section { margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px; }
  .scroll-toggle { background: #f4efdf; border: 1px solid #d2b48c; color: #8b4513; padding: 4px 12px; cursor: pointer; border-radius: 15px; font-size: 12px; }
  .diary-scroll { margin-top: 10px; background: #fdf5e6; border-left: 8px solid #8b4513; padding: 15px; max-height: 250px; overflow: hidden; }
  .diary-content { writing-mode: vertical-rl; height: 180px; font-size: 16px; line-height: 1.8; color: #3d2b1f; }

  .scroll-unfold-enter-active { transition: all 0.6s ease; max-height: 250px; }
  .scroll-unfold-enter-from { max-height: 0; opacity: 0; }

  svg { width: 100%; height: 100%; display: block; }
</style>
