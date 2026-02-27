<template>
  <div class="ink-sea-master-wrapper">
    <div class="canvas-viewport" ref="inkContainer">
      <!-- 1. 地理印章層 -->
      <div class="geo-seals-board">
        <div v-for="city in activeAnchors" :key="city.id" 
             class="seal-node" 
             :style="{ left: city.px + 'px', top: city.py + 'px' }"
             :class="{ active: currentAnchorID === city.id, minor: city.type === 'minor' }">
          <div class="seal-inner">{{ city.name }}</div>
        </div>
      </div>
      
      <!-- 2. SVG 繪圖層 -->
      <svg id="ink-sea-svg"></svg>
      
      <!-- 3. 敘事卡片 -->
      <transition name="ya-fade">
        <div v-if="selectedSocial" class="social-vertical-card">
          <div class="card-sidebar-right">
            <div class="sidebar-name">{{ selectedSocial.target_id || selectedSocial.target.id }}</div>
            <div class="sidebar-meta">
              <div class="sidebar-tag">{{ activeEvent.action }}</div>
              <div class="sidebar-info">{{ activeEvent.date }} · {{ activeEvent.location }}</div>
            </div>
          </div>
          <div class="card-content-left">
            <div class="narrative-text">
              {{ activeEvent.summary }}
            </div>
          </div>
          <div v-if="selectedSocial.events && selectedSocial.events.length > 1" class="card-pag-dock">
            <div class="pag-arrow" @click="prevEvent">▲</div>
            <div class="pag-label">
              <span class="c">{{ currentEventIdx + 1 }}</span><span class="s">/</span><span class="t">{{ selectedSocial.events.length }}</span>
            </div>
            <div class="pag-arrow" @click="nextEvent">▼</div>
          </div>
          <div class="close-card-btn" @click="closeCard">×</div>
        </div>
      </transition>
    </div>

    <!-- 4. 雅致時間軸 -->
    <div class="timeline-bar-ya">
      <div class="year-hub">
        <span class="label">生平紀元</span>
        <span class="val">{{ currentYear }}</span>
        <span class="age">{{ currentYear - 1865 + 1 }} 歲</span>
      </div>
      <div class="slider-container">
        <input type="range" min="1865" max="1955" v-model.number="currentYear" class="slider-ya" @input="refreshUI">
      </div>
      <div class="ticks-track">
        <div v-for="tick in timelineMarkers" :key="tick.year" 
             class="tick-anchor" 
             :style="{ left: calculateTickPos(tick.year) + '%' }">
          <div class="tick-line"></div>
          <div class="tick-text-box">
            <span class="t-year">{{ tick.year }}</span>
            <span class="t-label">{{ tick.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

const GEO_CONFIG = [
  { id: 'bj', name: '北平', x: 0.65, y: 0.12, type: 'major', matches: ['北平', '北京', '燕'] },
  { id: 'sh', name: '上海', x: 0.88, y: 0.40, type: 'major', matches: ['上海', '滬', '吳淞', '十六鋪'] },
  { id: 'hz', name: '杭州', x: 0.82, y: 0.62, type: 'major', matches: ['杭州', '西湖', '棲霞嶺'] },
  { id: 'sx', name: '歙縣', x: 0.76, y: 0.72, type: 'minor', matches: ['歙', '潭渡', '徽州'] },
  { id: 'jh', name: '金華', x: 0.82, y: 0.82, type: 'minor', matches: ['金華', '婺'] },
  { id: 'sc', name: '四川', x: 0.15, y: 0.50, type: 'major', matches: ['四川', '蜀', '成都', '重慶', '宜昌', '夔', '巫', '岷', '樂山', '青城', '灌'] },
  { id: 'gz', name: '廣州', x: 0.30, y: 0.85, type: 'major', matches: ['廣州', '嶺南', '粵'] },
  { id: 'nj', name: '南京', x: 0.72, y: 0.32, type: 'minor', matches: ['南京', '金陵', '寧'] },
  { id: 'wh', name: '武漢', x: 0.45, y: 0.52, type: 'minor', matches: ['武漢', '漢口', '鄂'] }
];

export default {
  name: 'InkSeaMap',
  data() {
    return {
      currentYear: 1932,
      currentFocus: '上海',
      currentAnchorID: 'sh',
      selectedSocial: null,
      currentEventIdx: 0,
      allNodes: [],
      allLinks: [],
      simulation: null,
      activeAnchors: [],
      timelineMarkers: [
        { year: 1865, label: '誕生' },
        { year: 1907, label: '入滬' },
        { year: 1932, label: '蜀遊' },
        { year: 1937, label: '避難' },
        { year: 1948, label: '西湖' },
        { year: 1955, label: '卒' }
      ]
    };
  },
  computed: {
    activeEvent() {
      if (!this.selectedSocial || !this.selectedSocial.events) return null;
      return this.selectedSocial.events[this.currentEventIdx];
    }
  },
  async mounted() {
    await this.loadData();
    this.initGraph();
    window.addEventListener('resize', this.initGraph);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.initGraph);
    if (this.simulation) this.simulation.stop();
  },
  methods: {
    async loadData() {
      try {
        const res = await fetch('/data/social_network_data.json');
        const data = await res.json();
        const w = window.innerWidth, h = window.innerHeight;
        this.allNodes = data.nodes.map(n => ({
          ...n, display_name: n.display_name || n.id, x: w/2, y: h/2
        }));
        const nodeMap = new Map(this.allNodes.map(n => [n.id, n]));
        this.allLinks = data.links.map(l => ({
          ...l,
          source: nodeMap.get(l.source) || l.source,
          target: nodeMap.get(l.target) || l.target
        }));
      } catch (e) { console.error(e); }
    },
    initGraph() {
      if (this.simulation) this.simulation.stop();
      const el = this.$refs.inkContainer;
      if (!el || !this.allNodes.length) return;
      const rect = el.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      this.activeAnchors = GEO_CONFIG.map(a => ({ ...a, px: a.x * w, py: a.y * h }));
      const svg = d3.select('#ink-sea-svg').attr('width', w).attr('height', h);
      svg.selectAll('*').remove();
      this.linkGroup = svg.append('g');
      this.nodeGroup = svg.append('g');
      this.simulation = d3.forceSimulation(this.allNodes)
        .force('link', d3.forceLink(this.allLinks).id(d => d.id).distance(120).strength(0.015))
        .force('charge', d3.forceManyBody().strength(-350))
        .force('center', d3.forceCenter(w / 2, h / 2))
        .force('collision', d3.forceCollide().radius(50));
      this.simulation.on('tick', this.ticked);
      this.refreshUI();
    },
    calculateTickPos(year) { return ((year - 1865) / (1955 - 1865)) * 100; },
    closeCard() { this.selectedSocial = null; this.currentEventIdx = 0; },
    prevEvent() {
      const len = this.selectedSocial.events.length;
      this.currentEventIdx = (this.currentEventIdx - 1 + len) % len;
    },
    nextEvent() {
      const len = this.selectedSocial.events.length;
      this.currentEventIdx = (this.currentEventIdx + 1) % len;
    },
    refreshUI() {
      if (!this.simulation) return;
      const year = this.currentYear;
      const w = this.$refs.inkContainer.clientWidth, h = this.$refs.inkContainer.clientHeight;
      const visibleLinks = this.allLinks.filter(l => l.year <= year);
      const activeNodeIds = new Set(visibleLinks.map(l => l.target.id || l.target));
      activeNodeIds.add('黄賓虹');
      const visibleNodes = this.allNodes.filter(n => activeNodeIds.has(n.id));
      const lastL = visibleLinks.length ? visibleLinks[visibleLinks.length - 1].location : '金華';
      this.currentFocus = lastL;
      const hbhAnchor = this.activeAnchors.find(a => a.matches.some(m => lastL.includes(m))) || this.activeAnchors.find(a => a.id === 'sh');
      this.currentAnchorID = hbhAnchor.id;
      const hbh = this.allNodes.find(n => n.id === '黄賓虹');
      if (hbh) { hbh.fx = hbhAnchor.px; hbh.fy = hbhAnchor.py; }
      this.linkSelection = this.linkGroup.selectAll('.link-path')
        .data(visibleLinks, d => d.year + (d.target.id || d.target))
        .join('path').attr('class', 'link-path').attr('fill', 'none').attr('stroke', '#1a1a1a')
        .attr('filter', 'url(#ink-spread-ya)');
      this.nodeSelection = this.nodeGroup.selectAll('.node-unit')
        .data(visibleNodes, d => d.id)
        .join(enter => {
          const g = enter.append('g').attr('class', 'node-unit');
          g.append('circle').attr('filter', 'url(#ink-spread-ya)');
          g.append('text').attr('text-anchor', 'middle').style('font-weight', 'bold');
          return g;
        })
        .on('click', (e, d) => {
          const link = this.allLinks.find(l => l.year === year && (l.target.id === d.id || l.target === d.id));
          if (link) { this.selectedSocial = link; this.currentEventIdx = 0; }
          else {
            const history = this.allLinks.filter(l => l.year < year && (l.target.id === d.id || l.target === d.id)).reverse()[0];
            if (history) { this.selectedSocial = history; this.currentEventIdx = 0; }
          }
        });
      this.circleSelection = this.nodeSelection.select('circle');
      this.textSelection = this.nodeSelection.select('text');
      this.simulation.force('x', d3.forceX(d => {
        if (d.id === '黄賓虹' || this.allLinks.some(l => l.year === year && (l.target.id === d.id || l.target === d.id))) return hbhAnchor.px;
        const home = this.activeAnchors.find(a => d.home_city && a.matches.some(m => d.home_city.includes(m)));
        return home ? home.px : w/2;
      }).strength(0.2));
      this.simulation.force('y', d3.forceY(d => {
        if (d.id === '黄賓虹' || this.allLinks.some(l => l.year === year && (l.target.id === d.id || l.target === d.id))) return hbhAnchor.py;
        const home = this.activeAnchors.find(a => d.home_city && a.matches.some(m => d.home_city.includes(m)));
        return home ? home.py : h/2;
      }).strength(0.2));
      this.simulation.alpha(0.3).restart();
    },
    ticked() {
      const el = this.$refs.inkContainer;
      if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      const year = this.currentYear;

      if (this.nodeSelection) {
        this.allNodes.forEach(d => {
          const link = this.allLinks.find(l => l.year === year && (l.target.id === d.id || l.target === d.id));
          const freq = link ? link.frequency : 0;
          const r = d.id === '黄賓虹' ? 28 : (9 + Math.min(freq, 8) * 1.8);
          const dy = r + 16; // 名字標籤的垂直偏移
          
          // 修正邊界鎖邏輯：考慮名字標籤的高度
          d.x = Math.max(30, Math.min(w - 30, d.x)); // 側邊留白防止長名字溢出
          d.y = Math.max(r, Math.min(h - dy - 15, d.y)); // 底部留出 r + dy + 15px 的安全距離
        });
        this.nodeSelection.attr('transform', d => `translate(${d.x},${d.y})`);
        this.circleSelection.attr('r', d => {
          if (d.id === '黄賓虹') return 28;
          const link = this.allLinks.find(l => l.year === year && (l.target.id === d.id || l.target === d.id));
          return 9 + Math.min(link ? link.frequency : 0, 8) * 1.8;
        }).attr('opacity', d => this.allLinks.some(l => l.year === year && (l.target.id === d.id || l.target === d.id)) ? 1 : 0.35);
        this.textSelection.text(d => d.display_name).attr('dy', d => {
          const link = this.allLinks.find(l => l.year === year && (l.target.id === d.id || l.target === d.id));
          return (d.id === '黄賓虹' ? 28 : (9 + Math.min(link ? link.frequency : 0, 8) * 1.8)) + 16;
        });
      }

      if (this.linkSelection) {
        this.linkSelection
          .attr('stroke-width', d => d.year === year ? 1.2 : 0.5)
          .attr('stroke-opacity', d => d.year === year ? 0.6 : 0.15)
          .attr('stroke-dasharray', d => d.has_face_to_face ? 'none' : '3,3')
          .attr('d', d => {
            const s = d.source, t = d.target;
            if (!s.x || !t.x) return null;
            const dx = t.x - s.x, dy = t.y - s.y;
            const dr = Math.sqrt(dx*dx + dy*dy) * 1.5 || 1;
            return `M${s.x},${s.y} A${dr},${dr} 0 0,1 ${t.x},${t.y}`;
          });
      }
    }
  }
};
</script>

<style scoped>
.ink-sea-master-wrapper { height: 100%; display: flex; flex-direction: column; background: #fdf5e6; position: relative; overflow: hidden; font-family: "Kai Ti", serif; }
.canvas-viewport { flex: 1; position: relative; overflow: hidden; background-image: url('https://www.transparenttextures.com/patterns/p6.png'); }
.geo-seals-board { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
.seal-node { position: absolute; transform: translate(-50%, -50%); opacity: 0.4; transition: 0.8s; }
.seal-node.active { opacity: 1; transform: translate(-50%, -50%) scale(1.1); z-index: 2; }
.seal-inner { writing-mode: vertical-rl; border: 1.5px solid #c0392b; color: #c0392b; padding: 8px 4px; font-weight: bold; font-size: 20px; background: rgba(255, 255, 255, 0.6); }
.seal-node.minor .seal-inner { font-size: 14px; padding: 4px 2px; border-width: 1px; }
#ink-sea-svg { width: 100%; height: 100%; position: relative; z-index: 5; background: transparent; }

.timeline-bar-ya { height: 85px; background: #f4efdf; display: flex; flex-direction: column; justify-content: space-between; padding: 10px 80px; flex-shrink: 0; z-index: 20; border-top: 1px solid #d2b48c; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); overflow: hidden; }
.year-hub { display: flex; align-items: baseline; justify-content: center; gap: 12px; height: 30px; }
.year-hub .val { font-size: 26px; font-weight: bold; color: #1a1a1a; font-family: Georgia, serif; }
.year-hub .age { color: #c0392b; font-size: 13px; font-weight: bold; background: rgba(192, 57, 43, 0.1); padding: 1px 8px; border-radius: 10px; }
.slider-container { width: 100%; height: 15px; display: flex; align-items: center; }
.slider-ya { width: 100%; -webkit-appearance: none; background: #d2b48c; height: 2px; border-radius: 2px; outline: none; }
.slider-ya::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #c0392b; border: 2px solid #fff; border-radius: 50%; cursor: pointer; }
.ticks-track { position: relative; width: 100%; height: 35px; }
.tick-anchor { position: absolute; top: 0; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; }
.tick-line { width: 1px; height: 4px; background: #8b7d6b; opacity: 0.6; }
.tick-text-box { display: flex; flex-direction: column; align-items: center; line-height: 1; margin-top: 2px; }
.t-year { font-size: 10px; font-weight: bold; color: #8b7d6b; font-family: Arial; }
.t-label { font-size: 9px; color: #c0392b; font-weight: bold; white-space: nowrap; margin-top: 1px; }

.social-vertical-card { position: absolute; top: 20px; right: 20px; width: 500px; height: 85%; background: #fff; border: 1.5px solid #d2b48c; box-shadow: 20px 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: row-reverse; padding: 40px 25px; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); border-radius: 4px; z-index: 100; }
.card-sidebar-right { writing-mode: vertical-rl; border-left: 2px solid #c0392b; padding-left: 15px; margin-left: 15px; flex-shrink: 0; display: flex; flex-direction: column; gap: 15px; }
.sidebar-name { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; line-height: 1; }
.sidebar-meta { display: flex; flex-direction: row; gap: 15px; align-items: center; }
.sidebar-tag { color: #c0392b; border: 1.2px solid #c0392b; text-align: center; font-size: 13px; padding: 5px 2px; width: 20px; line-height: 1.1; }
.sidebar-info { font-size: 14px; color: #8b4513; font-weight: bold; opacity: 0.8; }
.card-content-left { flex: 1; height: 100%; overflow-x: auto; overflow-y: hidden; }
.narrative-text { writing-mode: vertical-rl; height: 100%; font-size: 16px; line-height: 2.2; text-align: justify; color: #3d2b1f; padding-right: 15px; padding-left: 60px; }
.card-pag-dock { position: absolute; bottom: 25px; left: 20px; display: flex; flex-direction: column; align-items: center; gap: 5px; background: rgba(244, 239, 223, 0.95); padding: 8px 5px; border: 1px solid #d2b48c; border-radius: 15px; }
.pag-arrow { cursor: pointer; color: #c0392b; font-size: 14px; padding: 2px; }
.pag-label { display: flex; flex-direction: column; align-items: center; font-family: Georgia, serif; line-height: 1; }
.pag-label .c { font-weight: bold; color: #1a1a1a; font-size: 15px; }
.pag-label .t { font-size: 11px; color: #8b7d6b; }
.close-card-btn { position: absolute; top: 15px; left: 15px; cursor: pointer; font-size: 26px; color: #8b7d6b; transition: 0.3s; }
.close-card-btn:hover { color: #c0392b; transform: rotate(90deg); }
.ya-fade-enter-active, .ya-fade-leave-active { transition: opacity 0.4s; }
.ya-fade-enter-from, .ya-fade-leave-to { opacity: 0; }
</style>
