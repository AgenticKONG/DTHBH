<template>
  <div class="soulmate-ribbon-container">
    <div class="ribbon-header-ya">
      <span class="ribbon-title-label">知音對話：</span>
      <div class="soulmate-nav">
        <div v-for="f in availableFriends" :key="f" class="soulmate-btn" :class="{ active: selectedFriend === f }" @click="selectFriend(f)">{{ f }}</div>
      </div>
    </div>

    <div class="ribbon-scroll-view custom-scrollbar" ref="scrollContainer" @wheel="handleWheel">
      <div class="ribbon-canvas-wrap" :style="{ width: canvasWidth + 'px' }">
        <div class="ribbon-bg-layers">
          <div v-for="era in dynamicEras" :key="era.name" class="era-zone" :style="{ left: era.x + 'px', width: era.w + 'px', backgroundColor: era.color }">
            <span class="era-label-bg">{{ era.name }}</span>
          </div>
        </div>

        <svg id="ribbon-svg">
          <defs>
            <filter id="ink-spread-ya" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="seed-grad"><stop offset="0%" stop-color="#c0392b" /><stop offset="100%" stop-color="transparent" /></radialGradient>
          </defs>
        </svg>

        <transition name="ya-fade">
          <div v-if="selectedEvent" class="social-vertical-card" :style="{ left: tooltipPos.x + 'px' }">
            <div class="card-sidebar-right">
              <div class="sidebar-identity"><div class="sender-name">{{ getSenderName(selectedEvent) }}</div></div>
              <div class="sidebar-meta">
                <div class="sidebar-tag">{{ selectedEvent.topic }}</div>
                <div class="sidebar-info">{{ selectedEvent.date }}</div>
              </div>
              <div v-if="selectedEvent.details" class="sidebar-action-btn" @click="showDeepArchive = true">研讀原文</div>
            </div>
            <div class="card-content-left">
              <div class="narrative-text">
                <div v-if="selectedEvent.quote" class="text-quote">「 {{ selectedEvent.quote }} 」</div>
                <div v-if="selectedEvent.summary" class="text-summary">{{ selectedEvent.summary }}</div>
              </div>
            </div>
            <div v-if="currentCluster.length > 1" class="card-pag-dock">
              <div class="pag-arrow" @click="prevInCluster">▲</div>
              <div class="pag-label"><span class="c">{{ clusterIdx + 1 }}</span>/<span>{{ currentCluster.length }}</span></div>
              <div class="pag-arrow" @click="nextInCluster">▼</div>
            </div>
            <div class="close-card-btn" @click="selectedEvent = null">×</div>
          </div>
        </transition>

        <transition name="ya-fade">
          <div v-if="showDeepArchive && selectedEvent" class="deep-archive-overlay" @click.self="showDeepArchive = false">
            <div class="archive-scroll-paper">
              <div class="paper-header">史料原文：{{ selectedEvent.topic }}</div>
              <div class="paper-body custom-scrollbar">{{ selectedEvent.details }}</div>
              <div class="paper-footer">
                <span v-if="selectedEvent.Artifact_Refs">【文獻出處】{{ selectedEvent.Artifact_Refs }}</span>
                <div class="close-paper" @click="showDeepArchive = false">合上長札</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="ribbon-legend-ya">
      <div class="legend-unit"><i class="seed-dot-big"></i> 宿命初識</div>
      <div class="legend-unit"><i class="line-hbh"></i> 黃賓虹 (焦墨)</div>
      <div class="legend-unit"><i class="line-friend"></i> 知音 (石青)</div>
      <div class="legend-unit"><i class="farewell-node"></i> 物理終點</div>
      <div class="legend-unit" v-if="selectedFriend==='傅雷'"><i class="echo-dot-sample"></i> 跨時空回響</div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'SoulmateRibbon',
  data() {
    return {
      selectedFriend: '傅雷',
      availableFriends: ['傅雷', '許承堯', '陳柱', '黃節'],
      allData: {},
      hbhHistory: [],
      dynamicEras: [],
      selectedEvent: null,
      showDeepArchive: false,
      currentCluster: [],
      clusterIdx: 0,
      tooltipPos: { x: 0, y: 0 },
      canvasWidth: 6000,
      margin: { top: 150, right: 350, bottom: 100, left: 150 }
    };
  },
  async mounted() {
    await this.loadData();
    this.drawRibbon();
    window.addEventListener('resize', this.drawRibbon);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.drawRibbon);
  },
  methods: {
    handleWheel(e) {
      if (e.deltaY !== 0) {
        this.$refs.scrollContainer.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    },
    async loadData() {
      try {
        const resHBH = await fetch('/data/hbh_location_history.json');
        this.hbhHistory = await resHBH.json();
        const resOthers = await fetch('/data/soulmate_ribbon_data.json');
        this.allData = await resOthers.json();
        const resFL = await fetch('/data/fulei_deep_data.json');
        this.allData['傅雷'] = await resFL.json();
      } catch (e) { console.error(e); }
    },
    selectFriend(name) {
      this.selectedFriend = name;
      this.selectedEvent = null;
      this.showDeepArchive = false;
      this.$nextTick(() => { this.drawRibbon(); });
    },
    getSenderName(ev) {
      if (ev.is_echo) return "跨時空回響";
      const friendList = this.allData[this.selectedFriend];
      const livingOnly = friendList.filter(d => !d.is_echo);
      if (ev.norm_date === livingOnly[0].norm_date) return "宿命相逢";
      if (ev.norm_date === "1955.03.25") return "終成永訣";
      return (ev.hbh_loc === ev.friend_loc && !ev.is_letter) ? "莫逆相契" : "錦書遙寄";
    },
    prevInCluster() {
      this.clusterIdx = (this.clusterIdx - 1 + this.currentCluster.length) % this.currentCluster.length;
      this.selectedEvent = this.currentCluster[this.clusterIdx];
    },
    nextInCluster() {
      this.clusterIdx = (this.clusterIdx + 1) % this.currentCluster.length;
      this.selectedEvent = this.currentCluster[this.clusterIdx];
    },
    drawRibbon() {
      const friendData = this.allData[this.selectedFriend];
      if (!friendData || !friendData.length) return;
      const container = this.$refs.scrollContainer;
      if (!container) return;

      const parseDate = d3.timeParse("%Y.%m.%d");
      const deathDate = parseDate("1955.03.25");
      const livingOnly = friendData.filter(d => !d.is_echo);
      
      const startDate = parseDate(livingOnly[0].norm_date);
      const endDate = deathDate; // 軸嚴格截斷
      
      const timeScale = d3.scaleTime().domain([startDate, endDate]).range([this.margin.left, this.canvasWidth - this.margin.right]);
      const h = container.clientHeight, centerY = h / 2 - 20, baseOffset = 95; 
      const svg = d3.select('#ribbon-svg').attr('width', this.canvasWidth).attr('height', h);
      svg.selectAll('*').remove();

      // 時期背景
      this.dynamicEras = [];
      const eraColors = { "歙縣": "rgba(244, 224, 224, 0.2)", "上海": "rgba(244, 239, 223, 0.3)", "北平": "rgba(230, 230, 230, 0.3)", "杭州": "rgba(224, 244, 224, 0.3)" };
      this.hbhHistory.forEach((hbh, i) => {
        const next = this.hbhHistory[i+1]; if(!next) return;
        const s = parseDate(hbh.date), e = parseDate(next.date);
        const x = timeScale(Math.max(s, startDate)), w = timeScale(Math.min(e, endDate)) - x;
        if(w > 0) this.dynamicEras.push({ name: hbh.loc + '時期', x, w, color: eraColors[hbh.loc] || "rgba(0,0,0,0.02)" });
      });

      // 聚類與節點定位
      const clusters = [];
      livingOnly.forEach(ev => {
        const x = timeScale(parseDate(ev.norm_date));
        if (clusters.length > 0 && Math.abs(x - clusters[clusters.length-1].x) < 45) { clusters[clusters.length-1].events.push(ev); }
        else { clusters.push({ x, events: [ev], isSameLoc: (ev.hbh_loc === ev.friend_loc && !ev.is_letter), is_echo: false }); }
      });
      // 回響點：終點右側平鋪
      const deathX = timeScale(deathDate);
      friendData.filter(d => d.is_echo).forEach((ev, idx) => {
        clusters.push({ x: deathX + 100 + (idx * 60), events: [ev], isSameLoc: false, is_echo: true });
      });

      // 構建路徑 (1:1成對推入，杜絕亂跳)
      const timelineNodes = [];
      this.hbhHistory.forEach(node => {
        const d = parseDate(node.date);
        if (d >= startDate && d <= deathDate) timelineNodes.push({ ...node, date: node.date, is_hbh_move: true });
      });
      clusters.filter(c => !c.is_echo).forEach(c => timelineNodes.push({ ...c, date: c.events[0].norm_date, is_hbh_move: false }));
      timelineNodes.sort((a, b) => parseDate(a.date) - parseDate(b.date) || (a.is_hbh_move ? -1 : 1));

      const hbhPoints = [], friendPoints = [];
      let currentHBHLoc = "上海", lastPhysicalOffset = 5, lineStarted = false;

      timelineNodes.forEach((node, i) => {
        const x = timeScale(parseDate(node.date));
        if (node.is_hbh_move) currentHBHLoc = node.loc;
        if (parseDate(node.date) > deathDate) return;

        let isSameLoc = false, isLetter = false, clusterSize = 1;
        if (!node.is_hbh_move) {
          isSameLoc = node.isSameLoc; isLetter = node.events.some(e => e.is_letter); clusterSize = node.events.length; lineStarted = true;
        } else { isSameLoc = (node.loc === livingOnly[0].friend_loc); }
        
        const currentPhysicalOffset = isSameLoc ? 5 : baseOffset;
        const visualOffset = (isLetter && !isSameLoc) ? Math.max(15, 45 - (clusterSize * 6)) : currentPhysicalOffset;

        if (lineStarted) {
          const epsilon = 20;
          if (hbhPoints.length > 0 && x > hbhPoints[hbhPoints.length-1][0] + 1) {
            hbhPoints.push([x - epsilon, centerY - lastPhysicalOffset]);
            friendPoints.push([x - epsilon, centerY + lastPhysicalOffset]);
          }
          // 觸發點：絕對對齊
          hbhPoints.push([x, centerY - visualOffset]);
          friendPoints.push([x, centerY + visualOffset]);
          
          if (i < timelineNodes.length - 1 && timeScale(parseDate(timelineNodes[i+1].date)) > x + 1) {
            hbhPoints.push([x + 1, centerY - currentPhysicalOffset]);
            friendPoints.push([x + 1, centerY + currentPhysicalOffset]);
            hbhPoints.push([x + epsilon, centerY - currentPhysicalOffset]);
            friendPoints.push([x + epsilon, centerY + currentPhysicalOffset]);
          }
        }
        lastPhysicalOffset = currentPhysicalOffset;
      });

      const lineGen = d3.line().curve(d3.curveMonotoneX);
      svg.append('path').datum(hbhPoints).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#1a1a1a').attr('stroke-width', 4).attr('filter', 'url(#ink-spread-ya)');
      svg.append('path').datum(friendPoints).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#4a5a6a').attr('stroke-width', 3).attr('filter', 'url(#ink-spread-ya)');

      // 繪製節點
      const nodes = svg.append('g').selectAll('g').data(clusters).enter().append('g')
        .on('click', (e, d) => {
          this.currentCluster = d.events; this.clusterIdx = 0; this.selectedEvent = d.events[0];
          let targetX = d.x + 40; if (d.x > this.canvasWidth - 550) targetX = d.x - 540;
          this.tooltipPos = { x: targetX, y: 30 };
          svg.selectAll('.echo-arc').remove();
          if (d.is_echo) {
            const resNode = clusters.find(c => c.events.some(ev => ev.date.includes("1943.09")));
            const tx = resNode ? resNode.x : this.margin.left + 1500;
            svg.append('path').attr('class', 'echo-arc').attr('d', `M${d.x},${centerY} C${d.x},${centerY-250} ${tx},${centerY-250} ${tx},${centerY}`).attr('fill', 'none').attr('stroke', 'rgba(192, 57, 43, 0.4)').attr('stroke-width', 3).attr('stroke-dasharray', '8,4');
          }
        });

      clusters.forEach((d, idx) => {
        const group = nodes.filter(node => node === d), count = d.events.length, size = Math.min(40, 24 + (count - 1) * 4);
        if (d.is_echo) {
          group.append('circle').attr('cx', d.x).attr('cy', centerY).attr('r', 15).attr('fill', 'rgba(255,255,255,0.01)').style('cursor','pointer');
          group.append('circle').attr('cx', d.x).attr('cy', centerY).attr('r', 12).attr('fill', 'none').attr('stroke', 'rgba(192, 57, 43, 0.5)').attr('stroke-dasharray', '2,2');
          group.append('text').attr('x', d.x).attr('y', centerY + 4).attr('text-anchor', 'middle').attr('fill', 'rgba(192, 57, 43, 0.7)').attr('font-size', '10px').text('回');
        } else if (d.events[0].norm_date === livingOnly[0].norm_date) {
          group.append('circle').attr('cx', d.x).attr('cy', centerY).attr('r', 30).attr('fill', 'url(#seed-grad)').attr('opacity', 0.7);
          group.append('circle').attr('cx', d.x).attr('cy', centerY).attr('r', 8).attr('fill', '#c0392b');
          group.append('text').attr('x', d.x).attr('y', centerY + 5).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '14px').attr('font-weight', 'bold').text(count);
        } else if (d.events[0].norm_date === "1955.03.25") {
          group.append('rect').attr('x', d.x - 14).attr('y', centerY - 14).attr('width', 28).attr('height', 28).attr('fill', 'none').attr('stroke', '#c0392b').attr('stroke-dasharray', '2,2').attr('stroke-width', 2);
          group.append('text').attr('x', d.x).attr('y', centerY + 6).attr('text-anchor', 'middle').attr('fill', '#c0392b').attr('font-size', '12px').attr('font-weight', 'bold').text('终');
        } else if (d.isSameLoc) {
          group.append('rect').attr('x', d.x - size/2).attr('y', centerY - size/2).attr('width', size).attr('height', size).attr('fill', '#c0392b').attr('rx', 2);
          group.append('text').attr('x', d.x).attr('y', centerY + 6).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', '14px').attr('font-weight', 'bold').text(count);
        } else {
          const magneticDip = Math.max(15, 45 - (count * 6)), y1 = centerY - magneticDip, y2 = centerY + magneticDip;
          svg.append('line').attr('x1', d.x).attr('y1', y1).attr('x2', d.x).attr('y2', y2).attr('stroke', 'rgba(166, 123, 91, 0.4)').attr('stroke-dasharray', '2,2');
          group.append('circle').attr('cx', d.x).attr('cy', y1).attr('r', 6).attr('fill', '#1a1a1a');
          group.append('circle').attr('cx', d.x).attr('cy', y2).attr('r', 6).attr('fill', '#4a5a6a');
          group.append('circle').attr('cx', d.x).attr('cy', centerY).attr('r', size/2 - 2).attr('fill', '#fdf5e6').attr('stroke', '#c0392b').attr('stroke-width', 2);
          group.append('text').attr('x', d.x).attr('y', centerY + 5).attr('text-anchor', 'middle').attr('fill', '#c0392b').attr('font-size', '13px').attr('font-weight', 'bold').text(count);
        }
      });

      const xAxis = d3.axisBottom(timeScale).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat("%Y"));
      svg.append('g').attr('transform', `translate(0, ${h - 50})`).call(xAxis).selectAll("text").style("font-size", "12px").style("fill", "#8b4513");
    }
  }
};
</script>

<style scoped>
.soulmate-ribbon-container { height: 100%; display: flex; flex-direction: column; background: #fdf5e6; font-family: "Kai Ti", serif; }
.ribbon-header-ya { padding: 15px 40px; display: flex; align-items: center; gap: 20px; background: rgba(244, 239, 223, 0.95); border-bottom: 1px solid #d2b48c; z-index: 10; }
.ribbon-title-label { font-weight: bold; color: #4a2e18; font-size: 18px; }
.soulmate-nav { display: flex; gap: 12px; }
.soulmate-btn { padding: 6px 20px; border: 1px solid #d2b48c; border-radius: 4px; cursor: pointer; color: #8b7d6b; transition: 0.3s; }
.soulmate-btn.active { background: #c0392b; color: #fff; border-color: #c0392b; box-shadow: 2px 2px 8px rgba(192, 57, 43, 0.2); }
.ribbon-scroll-view { flex: 1; overflow-x: auto; position: relative; }
.ribbon-bg-layers { position: absolute; inset: 0; pointer-events: none; display: flex; }
.era-zone { height: 100%; border-left: 1px dashed rgba(139, 125, 107, 0.1); position: absolute; transition: 0.5s; }
.era-label-bg { position: absolute; bottom: 80px; left: 20px; writing-mode: vertical-rl; font-size: 24px; color: #8b7d6b; opacity: 0.15; letter-spacing: 10px; font-weight: bold; }
.social-vertical-card { position: absolute; width: 500px; height: 260px; background: #fff; border: 1.5px solid #d2b48c; box-shadow: 20px 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: row-reverse; padding: 20px 15px; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); border-radius: 4px; z-index: 100; top: 30px !important; }
.card-sidebar-right { writing-mode: vertical-rl; border-left: 2px solid #c0392b; padding-left: 10px; margin-left: 10px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; position: relative; }
.sidebar-name { font-size: 22px; font-weight: bold; color: #1a1a1a; line-height: 1.2; letter-spacing: 2px; margin-bottom: 5px; }
.sidebar-action-btn { margin-top: auto; color: #fff; background: #c0392b; cursor: pointer; font-size: 12px; font-weight: bold; padding: 10px 2px; text-align: center; border-radius: 2px; writing-mode: vertical-rl; letter-spacing: 2px; transition: 0.3s; z-index: 120; }
.sidebar-action-btn:hover { background: #a93226; transform: scale(1.05); }
.card-content-left { flex: 1; height: 100%; overflow-x: auto; overflow-y: hidden; }
.narrative-text { writing-mode: vertical-rl; height: 100%; padding-right: 8px; display: flex; flex-direction: column; }
.text-quote { font-size: 16px; font-weight: bold; color: #1a1a1a; line-height: 1.5; margin-bottom: 10px; }
.text-summary { font-size: 13px; line-height: 1.8; color: #3d2b1f; text-align: justify; }
.card-pag-dock { position: absolute; bottom: 15px; left: 15px; display: column; align-items: center; gap: 3px; background: rgba(244, 239, 223, 0.95); padding: 5px 3px; border: 1px solid #d2b48c; border-radius: 10px; z-index: 110; }
.pag-arrow { cursor: pointer; color: #c0392b; font-size: 10px; }
.pag-label { display: flex; flex-direction: column; align-items: center; font-family: Georgia; line-height: 1; }
.close-card-btn { position: absolute; top: 8px; left: 8px; cursor: pointer; font-size: 20px; color: #8b7d6b; z-index: 120; }
.deep-archive-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); }
.archive-scroll-paper { width: 850px; height: 85%; background: #fff; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); border: 25px solid #3d2b1f; border-image: url('https://www.transparenttextures.com/patterns/p6.png') 30 round; padding: 50px; box-shadow: 0 0 120px rgba(0,0,0,0.6); display: flex; flex-direction: column; }
.paper-header { font-size: 26px; font-weight: bold; color: #c0392b; border-bottom: 2px solid #d2b48c; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
.paper-body { flex: 1; font-size: 19px; line-height: 2.6; color: #1a1a1a; overflow-y: auto; text-align: justify; padding-right: 25px; white-space: pre-wrap; font-family: "Kai Ti", serif; }
.paper-footer { margin-top: 30px; border-top: 1px solid #d2b48c; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; color: #8b7d6b; }
.close-paper { color: #c0392b; font-weight: bold; cursor: pointer; border: 1.5px solid #c0392b; padding: 8px 20px; border-radius: 4px; transition: 0.3s; }
.ribbon-legend-ya { height: 50px; display: flex; justify-content: center; gap: 40px; align-items: center; background: #f4efdf; border-top: 1px solid #d2b48c; font-size: 14px; color: #4a2e18; }
.legend-unit { display: flex; align-items: center; gap: 8px; }
.seed-dot-big { width: 16px; height: 16px; background: #c0392b; border-radius: 50%; box-shadow: 0 0 12px #c0392b; }
.line-hbh { width: 30px; height: 4px; background: #1a1a1a; }
.line-friend { width: 30px; height: 4px; background: #4a5a6a; }
.farewell-node { width: 14px; height: 14px; border: 1.5px dashed #c0392b; position: relative; }
.farewell-node::after { content: '终'; font-size: 8px; color: #c0392b; position: absolute; left: 1px; top: -1px; }
.string-resonance-multi { width: 30px; height: 6px; border-top: 1px dashed #a67b5b; border-bottom: 1px dashed #a67b5b; opacity: 0.6; }
.echo-dot-sample { width: 12px; height: 12px; border: 1.2px dashed #c0392b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7px; color: #c0392b; }
.echo-dot-sample::after { content: '回'; }
.custom-scrollbar { scroll-behavior: smooth; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 8px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #8b4513; border-radius: 10px; }
.ya-fade-enter-active, .ya-fade-leave-active { transition: opacity 0.4s; }
.ya-fade-enter-from, .ya-fade-leave-to { opacity: 0; }
</style>
