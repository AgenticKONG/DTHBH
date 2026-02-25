<template>
  <div class="container">
    <h1>黄宾虹交友网络</h1>

    <p class="intro">探索黄宾虹的交友网络与关键好友的时间线，了解这位艺术大师的人生历程与艺术成就</p>

    <!-- 顶部 tab -->
    <div class="nav-tabs">
      <div class="nav-tab" :class="{ active: activeView === 'overview-view' }" @click="switchTab('overview-view')">
        交友网络
      </div>

      <div class="nav-tab" :class="{ active: activeView === 'timeline-view' }" @click="switchTab('timeline-view')">
        关键好友时间轴
      </div>
    </div>

    <!-- 交友网络总览 -->
    <div id="overview-view" class="view" :class="{ active: activeView === 'overview-view' }">
      <svg id="overview-svg"></svg>
    </div>

    <!-- 地图视图 -->
    <div id="map-view" class="view" :class="{ active: activeView === 'map-view' }">
      <button class="back-btn" @click="backToOverview"><i>↩</i> 返回总览</button>

      <div class="map-info">
        <div class="map-title">{{ mapPlaceName }}</div>
        <div id="map-place-desc">{{ mapPlaceDesc }}</div>
        <div class="friend-info" id="map-friends"><strong>主要好友:</strong> {{ mapFriends }}</div>
      </div>

      <div class="year-label">{{ mapYear }}</div>

      <!-- 好友详情弹窗 -->
      <div class="friend-details" :class="{ active: friendDialogVisible }">
        <button class="close-btn" @click="friendDialogVisible = false">&times;</button>

        <div class="friend-name">{{ friendName }}</div>
        <div class="friend-history">{{ friendHistory }}</div>
      </div>

      <svg id="map-svg"></svg>
    </div>

    <!-- 时间轴视图 -->
    <div id="timeline-view" class="view" :class="{ active: activeView === 'timeline-view' }">
      <button class="back-btn" @click="backToOverview"><i>↩</i> 返回总览</button>

      <div class="timeline-container">
        <svg id="timeline-svg"></svg>
      </div>

      <!-- 时间事件弹窗 -->
      <div class="event-details" :class="{ active: eventDialogVisible }">
        <button class="close-btn" @click="eventDialogVisible = false">&times;</button>

        <div class="event-title">{{ eventTitle }}</div>
        <div class="event-description">{{ eventDescription }}</div>
        <div class="event-meta">{{ eventMeta }}</div>
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

      mapPlaceName: '',
      mapPlaceDesc: '',
      mapFriends: '',
      mapYear: '',

      friendDialogVisible: false,
      friendName: '',
      friendHistory: '',

      eventDialogVisible: false,
      eventTitle: '',
      eventDescription: '',
      eventMeta: '',

      /* 数据由store管理 */
      data: {
        core: { id: '黄宾虹', birth: 1865, death: 1955 },
        locations: [],
        timelineEvents: []
      },

      // 状态管理
      loading: false,
      error: null
    };
  },

  async mounted() {
    await this.loadData();
    this.initOverview();
    this.initTimeline();
    window.addEventListener('resize', this.onResize);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },

  methods: {
    /* ---------- 数据 ---------- */
    async loadData() {
      const store = getDataStore();

        try {
        this.loading = true;
        this.error = null;

          const allData = await store.fetchAllData();
        this.data.core = allData.core;
        this.data.locations = allData.locations;
        this.data.timelineEvents = allData.timelineEvents;
      } catch (e) {
        this.error = e.message || '加载数据失败';
        console.error('接口异常', e);
      } finally {
        this.loading = false;
      }
    },

    /* ---------- 导航 ---------- */
    goHome() {
      alert('跳转到首页');
    },
    goExplore() {
      alert('跳转到黄宾虹研究页面');
    },
    switchTab(view) {
      this.activeView = view;
      if (view === 'timeline-view') {
        this.$nextTick(() => this.initTimeline());
      }
    },
    backToOverview() {
      this.activeView = 'overview-view';
      this.friendDialogVisible = false;
      this.eventDialogVisible = false;
    },

    /* ---------- Overview ---------- */
    initOverview() {
      const container = document.getElementById('overview-view');
      if (!container) return;

        const width = container.clientWidth;
      const height = container.clientHeight;
      const svg = d3.select('#overview-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      // 优化节点和链接的数据结构
      const nodes = [this.data.core];
      this.data.locations.forEach((loc) => nodes.push({ id: loc.id, type: 'place' }));

      const people = new Set();
      this.data.locations.forEach((loc) => loc.people.forEach((p) => people.add(p.name)));
      people.forEach((p) => nodes.push({ id: p, type: 'person' }));

      const links = [];
      this.data.locations.forEach((loc) => {
        links.push({ source: '黄宾虹', target: loc.id, type: 'core-place' });
        loc.people.forEach((person) => links.push({ source: loc.id, target: person.name, type: 'place-person' }));
      });

      // 优化力导向模拟参数
      const simulation = d3
        .forceSimulation()
        .force(
          'link',
          d3
            .forceLink()
            .id((d) => d.id)
            .distance((d) => {
              // 根据链接类型调整距离
              if (d.type === 'core-place') return 120;
              return 80;
            })
            .strength(0.7)
        )
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'collide',
          d3.forceCollide().radius((d) => {
            // 根据节点大小调整碰撞半径
            if (d.id === '黄宾虹') return 20;
            if (d.type === 'place') return 18;
            return 14;
          })
        )
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05));

      // 使用容器分组来优化渲染性能
      const linkGroup = svg.append('g').attr('class', 'links');
      const nodeGroup = svg.append('g').attr('class', 'nodes');
      const labelGroup = svg.append('g').attr('class', 'labels');

      // 优化链接渲染
      const link = linkGroup
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', (d) => (d.type === 'core-place' ? 2 : 1))
        .attr('stroke-opacity', (d) => (d.type === 'core-place' ? 0.8 : 0.5));

      // 优化节点渲染
      const node = nodeGroup
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', (d) => {
          if (d.id === '黄宾虹') return 'node core';
          if (d.type === 'place') return 'node place';
          return 'node person no-hover';
        })
        .attr('r', (d) => {
          if (d.id === '黄宾虹') return 18;
          if (d.type === 'place') return 14;
          return 10;
        })
        .style('transition', 'r 0.3s ease')
        .call(
          d3
            .drag()
            .on('start', this._dragStarted(simulation))
            .on('drag', this._dragged)
            .on('end', this._dragEnded(simulation))
        );

      // 添加悬停效果（仅对地点节点）
      node
        .filter((d) => d.type === 'place')
        .on('mouseenter', function () {
          d3.select(this).transition().duration(200).attr('r', 18).style('cursor', 'pointer');
        })
        .on('mouseleave', function () {
          d3.select(this).transition().duration(200).attr('r', 14).style('cursor', 'default');
        })
        .on('click', (event, d) => this.showMapView(d.id));

      // 优化标签渲染
      const label = labelGroup
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', (d) => (d.type === 'place' ? 'label place-label' : 'label'))
        .attr('dy', (d) => (d.type === 'place' ? 28 : 22))
        .text((d) => d.id)
        .style('font-size', (d) => {
          if (d.id === '黄宾虹') return '15px';
          if (d.type === 'place') return '13px';
          return '12px';
        })
        .style('font-weight', (d) => (d.type === 'place' ? 'bold' : 'normal'))
        .style('pointer-events', 'none');

      // 优化渲染循环
      simulation.nodes(nodes).on('tick', () => {
        // 批量更新链接位置
        link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        // 批量更新节点位置
        node
          .attr('cx', (d) => (d.x = Math.max(30, Math.min(width - 30, d.x))))
          .attr('cy', (d) => (d.y = Math.max(30, Math.min(height - 30, d.y))));

        // 批量更新标签位置
        label.attr('x', (d) => d.x).attr('y', (d) => d.y);
      });

      simulation.force('link').links(links);
    },

    _dragStarted(simulation) {
      return function (event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      };
    },
    _dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    },
    _dragEnded(simulation) {
      return function (event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      };
    },

    /* ---------- Map ---------- */
    showMapView(placeId) {
      const place = this.data.locations.find((loc) => loc.id === placeId);
      if (!place) return;
      this.activeView = 'map-view';
      this.mapPlaceName = place.id;
      this.mapPlaceDesc = place.info;
      this.mapYear = `主要活动时期: ${place.year}`;
      this.mapFriends = place.people.map((p) => p.name).join('、');
      this.$nextTick(() => this.drawMap(place));
    },

    drawMap(place) {
      const width = document.getElementById('map-view').clientWidth;
      const height = document.getElementById('map-view').clientHeight;
      const svg = d3.select('#map-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      const [cx, cy] = [width / 2, height / 2];
      const placeR = 18,
        personR = 12,
        r = 160;

      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', placeR).attr('fill', '#ebd976');

      svg
        .append('text')
        .attr('x', cx)
        .attr('y', cy - placeR - 12)
        .text(place.id)
        .attr('class', 'label place-label')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px');

      place.people.forEach((p, i) => {
        const angle = (i / place.people.length) * 2 * Math.PI;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);

        const sx = cx + placeR * Math.cos(angle);
        const sy = cy + placeR * Math.sin(angle);
        const ex = px - personR * Math.cos(angle);
        const ey = py - personR * Math.sin(angle);

        svg
          .append('line')
          .attr('x1', sx)
          .attr('y1', sy)
          .attr('x2', ex)
          .attr('y2', ey)
          .attr('class', 'link')
          .attr('stroke-width', 1.5);

        svg
          .append('circle')
          .attr('cx', px)
          .attr('cy', py)
          .attr('r', personR)
          .attr('fill', '#abc08d')
          .style('cursor', 'pointer')
          .on('click', () => this.showFriendDetails(p));

        svg
          .append('text')
          .attr('x', px)
          .attr('y', py + personR + 15)
          .text(p.name)
          .attr('class', 'label')
          .attr('text-anchor', 'middle')
          .style('cursor', 'pointer')
          .on('click', () => this.showFriendDetails(p));
      });
    },

    showFriendDetails(friend) {
      this.friendDialogVisible = true;
      this.friendName = friend.name;
      this.friendHistory = friend.history;
    },

    /* ---------- Timeline ---------- */
    initTimeline() {
      const container = document.querySelector('.timeline-container');
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const svg = d3.select('#timeline-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      const margin = { top: 50, right: 50, bottom: 50, left: 100 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const x = d3.scaleLinear().domain([1865, 1955]).range([0, innerW]);

      const friends = ['黄宾虹', ...new Set(this.data.timelineEvents.map((e) => e.person))];
      const y = d3.scalePoint().domain(friends).range([0, innerH]).padding(0.5);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      /* 轴线、刻度、标签略（与原来相同） */
      /* 省略部分与原来代码一致，直接复用即可 */

      /* ---------- 画轴线、刻度、人物标签 ---------- */
      // 主轴线（黄宾虹）
      g.append('line')
          .attr('x1', 0)
        .attr('y1', y('黄宾虹'))
          .attr('x2', innerW)
          .attr('y2', y('黄宾虹'))
        .attr('class', 'timeline-axis');

      // 其他人物虚线
        friends.forEach((friend) => {
          if (friend !== '黄宾虹') {
            g.append('line')
            .attr('x1', 0)
            .attr('y1', y(friend))
              .attr('x2', innerW)
            .attr('y2', y(friend))
            .attr('class', 'timeline-axis')
            .style('stroke-dasharray', '5,5')
            .style('stroke', '#8b7d6b');
          }
      });

      // 年份刻度
      const years = d3.range(1870, 1956, 10);
        years.forEach((year) => {
          g.append('line')
            .attr('x1', x(year))
            .attr('y1', y('黄宾虹') - 5)
          .attr('x2', x(year))
            .attr('y2', y('黄宾虹') + 5)
            .attr('class', 'timeline-axis');

          g.append('text')
          .attr('x', x(year))
            .attr('y', y('黄宾虹') - 10)
          .attr('text-anchor', 'middle')
            .attr('class', 'timeline-label')
            .text(year);
      });

      // 人物名称
        friends.forEach((friend) => {
          g.append('text')
            .attr('x', -10)
          .attr('y', y(friend))
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('class', 'timeline-label')
            .text(friend);
      });
      /* 事件节点与防重叠标签 */
      const placed = [];
      const nodes = this.data.timelineEvents.map((e) => ({
        x: x(e.year),
        y: y(e.person),
        r: e.artWeight || 6
      }));

      const overlap = (x1, y1, w1, h1, x2, y2, w2, h2, gap = 6) =>
        Math.abs(x1 - x2) < w1 / 2 + w2 / 2 + gap && Math.abs(y1 - y2) < h1 / 2 + h2 / 2 + gap;

      const hitNode = (lx, ly, lw, lh) =>
        nodes.some((n) => Math.abs(n.x - lx) < n.r + lw / 2 + 6 && Math.abs(n.y - ly) < n.r + lh / 2 + 6);

      this.data.timelineEvents.forEach((ev) => {
        const ex = x(ev.year);
        const ey = y(ev.person);

        g.append('line')
          .attr('x1', ex)
          .attr('y1', y('黄宾虹'))
          .attr('x2', ex)
          .attr('y2', ey)
          .attr('class', 'timeline-event-line');

        g.append('circle')
          .attr('cx', ex)
          .attr('cy', ey)
          .attr('r', ev.artWeight)
          .attr('class', 'timeline-event-circle timeline-event')
          .on('click', () => this.showEventDetails(ev));

        let tx = ex;
        let ty = ey - ev.artWeight - 8;
        const text = g
          .append('text')
          .attr('x', tx)
          .attr('y', ty)
          .text(ev.title)
          .attr('class', 'timeline-event-details')
          .attr('text-anchor', 'middle');

        let { width: tw, height: th } = text.node().getBBox();
        let attempts = 0;
        while (attempts++ < 80) {
          let collide = placed.some((p) => overlap(p.x, p.y, p.w, p.h, tx, ty, tw, th)) || hitNode(tx, ty, tw, th);
          if (!collide) break;

          const step = Math.ceil(attempts / 2);
          const dir = attempts % 2 === 0 ? -1 : 1;
          ty = ey - ev.artWeight - 8 + dir * step * (th + 6);
          if (attempts > 6) {
            const hStep = Math.ceil((attempts - 6) / 4);
            const hDir = attempts % 2 === 0 ? -1 : 1;
            tx = ex + hDir * hStep * (tw + 6);
          }
          text.attr('x', tx).attr('y', ty);
          ({ width: tw, height: th } = text.node().getBBox());
        }
        placed.push({ x: tx, y: ty, w: tw, h: th });
      });
    },

    showEventDetails(ev) {
      this.eventDialogVisible = true;
      this.eventTitle = `${ev.year}年 - ${ev.title}`;
      this.eventDescription = ev.description;
      this.eventMeta = `黄宾虹 ${ev.hbhAge}岁，${ev.person} ${ev.friendAge}岁，艺术重要性: ${ev.artWeight}/10`;
    },

    /* ---------- Resize ---------- */
    onResize() {
      if (this.activeView === 'overview-view') {
        d3.select('#overview-svg').selectAll('*').remove();
        this.initOverview();
      }
      if (this.activeView === 'timeline-view') {
        this.initTimeline();
      }
      if (this.activeView === 'map-view' && this.mapPlaceName) {
        const place = this.data.locations.find((l) => l.id === this.mapPlaceName);
        if (place) this.drawMap(place);
      }
    }
  }
};
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'SimSun', 'STSong', serif;
    color: #333;
    background: linear-gradient(135deg, #f5f0e6 0%, #e8dfca 100%);
    min-height: 100vh;
    overflow-x: hidden;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;
    background-color: rgba(248, 244, 230, 0.85);
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  h1 {
    text-align: center;
    color: #8b4513;
    border-bottom: 2px solid #d2b48c;
    padding-bottom: 10px;
    margin: 20px 0 30px 0;
  }
  .view {
    display: none;
    margin-top: 20px;
    height: 600px;
    border: 1px solid #d2b48c;
    border-radius: 5px;
    background-color: #fffbf0;
    position: relative;
  }
  .view.active {
    display: block;
  }
  #overview-view {
    overflow: hidden;
  }
  .node {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .node.place {
    fill: #ebd976; /* 地点节点颜色 */
    filter: drop-shadow(0 2px 4px rgba(235, 217, 118, 0.4));
  }
  .node.person {
    fill: #abc08d; /* 人物节点颜色 */
    filter: drop-shadow(0 1px 2px rgba(171, 192, 141, 0.3));
  }
  .node.core {
    fill: #80996a;
    filter: drop-shadow(0 3px 6px rgba(128, 153, 106, 0.5));
  }
  .link {
    stroke: #8b7d6b;
    stroke-opacity: 0.6;
    transition: stroke-opacity 0.3s ease;
  }
  .label {
    font-size: 12px;
    text-anchor: middle;
    pointer-events: none;
    text-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
  }
  .place-label {
    font-weight: bold;
  }
  /* 仅保留总览页面人物节点的无hover效果样式 */
  .node.person.no-hover:hover {
    fill: #abc08d; /* 保持原颜色，无变化 */
    cursor: default; /* 鼠标样式不变 */
  }
  .back-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: #d2b48c;
    border: none;
    color: #333;
    padding: 8px 15px;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'SimSun', serif;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .back-btn:hover {
    background-color: #a67c52;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  .map-info {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(255, 251, 240, 0.8);
    padding: 10px;
    border: 1px solid #d2b48c;
    border-radius: 3px;
    max-width: 250px;
    backdrop-filter: blur(5px);
  }
  .map-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: #8b4513;
  }
  .friend-info {
    font-size: 13px;
    margin-top: 5px;
  }
  .year-label {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(255, 251, 240, 0.8);
    padding: 3px 8px;
    border: 1px solid #d2b48c;
    border-radius: 3px;
    font-size: 14px;
  }
  .intro {
    text-align: center;
    margin: 10px 0 20px 0;
    color: #5c4033;
    line-height: 1.6;
  }
  .friend-details {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 251, 240, 0.95);
    padding: 20px;
    border: 2px solid #d2b48c;
    border-radius: 8px;
    width: 300px;
    text-align: center;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    z-index: 100;
    animation: fadeIn 0.3s ease;
  }
  .friend-details.active {
    display: block;
  }
  .friend-name {
    font-size: 18px;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 10px;
  }
  .friend-history {
    font-size: 14px;
    line-height: 1.5;
  }
  .close-btn {
    position: absolute;
    top: 5px;
    right: 10px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #8b4513;
    transition: transform 0.2s ease;
  }
  .close-btn:hover {
    transform: rotate(90deg);
  }
  .nav-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #d2b48c;
    padding-bottom: 5px;
  }
  .nav-tab {
    padding: 8px 15px;
    cursor: pointer;
    background-color: #f8f4e6;
    border: 1px solid #d2b48c;
    border-bottom: none;
    border-radius: 5px 5px 0 0;
    margin: 0 5px;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
  }
  .nav-tab:hover {
    background-color: #f0ece1;
  }
  .nav-tab.active {
    background-color: #fffbf0;
    font-weight: bold;
    border-bottom: 2px solid #fffbf0;
  }
  .timeline-container {
    padding: 20px;
    height: 550px;
    overflow-y: auto;
  }
  .timeline-axis {
    stroke: #8b4513;
    stroke-width: 2;
  }
  .timeline-label {
    font-size: 14px; /* 默认 12px，现调大 */
    font-weight: bold; /* 加粗 */
    fill: #5c4033; /* 保持原有颜色 */
  }
  .timeline-event {
    cursor: pointer;
  }
  .timeline-event-circle {
    fill: #c1272d;
    stroke: #8b4513;
    stroke-width: 1;
    transition: all 0.3s ease;
  }
  .timeline-event-circle:hover {
    fill: #ff4444;
    r: 10;
  }
  .timeline-event-line {
    stroke: #8b7d6b;
    stroke-width: 1;
    stroke-dasharray: 5, 5;
  }
  .timeline-event-details {
    font-size: 12px;
    fill: #333;
    text-anchor: middle;
  }
  .event-details {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 251, 240, 0.95);
    padding: 20px;
    border: 2px solid #d2b48c;
    border-radius: 8px;
    width: 400px;
    text-align: center;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    z-index: 100;
    animation: fadeIn 0.3s ease;
  }
  .event-details.active {
    display: block;
  }
  .event-title {
    font-size: 18px;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 10px;
  }
  .event-description {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .event-meta {
    font-size: 12px;
    color: #666;
  }

  /* 动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* 让 svg 在容器内适配 */
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .timeline-container g text[text-anchor='end'][x='-10'] {
    font-size: 18px !important;
    font-weight: 700 !important;
    fill: #4a2e18 !important;
    paint-order: stroke;
    stroke: #fff9e6;
    stroke-width: 6px;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 2px #d2b48c);
    letter-spacing: 0.4px !important;
  }
  .timeline-event-details {
    font-size: 13px !important; /* 原来是 12px，现调大两号 */
    font-weight: 600; /* 稍粗一点，看着更清晰 */
    fill: #333 !important; /* 保持原有颜色 */
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .container {
      padding: 20px 10px;
      margin: 0;
      border-radius: 0;
    }

    h1 {
      font-size: 1.5rem;
      margin: 15px 0 20px 0;
    }

    .view {
      height: 500px;
    }

    .nav-tabs {
      flex-wrap: wrap;
      gap: 5px;
    }

    .nav-tab {
      margin: 0;
      padding: 6px 12px;
      font-size: 0.9rem;
    }

    .map-info {
      max-width: 200px;
      padding: 8px;
      font-size: 0.9rem;
    }

    .friend-details,
    .event-details {
      width: 90%;
      max-width: 300px;
      padding: 15px;
    }

    .friend-name,
    .event-title {
      font-size: 1.2rem;
    }

    .friend-history,
    .event-description {
      font-size: 0.9rem;
    }

    .timeline-container {
      padding: 15px;
      height: 450px;
    }

    .timeline-label {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 15px 5px;
    }

    h1 {
      font-size: 1.3rem;
    }

    .view {
      height: 400px;
    }

    .nav-tabs {
      flex-direction: column;
      gap: 3px;
    }

    .nav-tab {
      width: 100%;
      justify-content: center;
      border-radius: 3px;
    }

    .map-info {
      position: static;
      margin-top: 10px;
      max-width: 100%;
    }

    .back-btn {
      position: static;
      margin-bottom: 10px;
    }

    .friend-details,
    .event-details {
      width: 95%;
      padding: 10px;
    }

    .friend-name,
    .event-title {
      font-size: 1rem;
    }

    .friend-history,
    .event-description {
      font-size: 0.85rem;
    }
  }
</style>
