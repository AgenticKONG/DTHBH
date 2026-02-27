<template>
  <!-- 外层 wrapper 用于垂直居中 -->
  <div class="middle-timeline-wrapper">
    <!-- 固定的图例容器 -->
    <div class="chart-legend-fixed">
      <div class="legend-item">
        <span class="legend-dot calligraphy-dot"></span>
        <span class="legend-text">书法</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot paintings-dot"></span>
        <span class="legend-text">画作</span>
      </div>
    </div>
    <!-- 固定的时代镜像轴线 (背景) -->
    <!-- <div class="fixed-mirror-axis"></div> -->

    <div v-if="activeTooltipYear !== null && showYearTooltipFlag" class="global-tooltip"
      :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
      <div class="tooltip-year">{{ activeTooltipYear }}年</div>
      <div class="tooltip-stats">
        <span class="tooltip-line">书法：{{ getCalligraphyTotal(activeTooltipYear) }}</span>
        <span class="tooltip-line">画作：{{ getPaintingsTotal(activeTooltipYear) }}</span>
      </div>
    </div>

    <!-- 左侧分类标签：镜像对称设计 (采用绝对定位，脱离文档流，不干扰原布局) -->
    <div class="event-type-labels">
      <div class="event-type-label biography-label">
        生平
        <div class="mirror-seal"></div>
      </div>
      <div class="event-type-label historical-label">
        史事
      </div>
    </div>

    <div class="middle-timeline-container" ref="timelineContainer">

      <!-- 折线图容器 - 随容器滚动 -->
      <div class="chart-lines-container">
        <svg class="chart-svg-main" :style="{ width: chartWidth + 'px', height: '100%' }">
          <!-- 定义水墨滤镜 -->
          <defs>
            <filter id="ink-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <linearGradient id="line-grad-paint" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#e67e22" stop-opacity="0.6" />
              <stop offset="50%" stop-color="#d35400" stop-opacity="1" />
              <stop offset="100%" stop-color="#e67e22" stop-opacity="0.6" />
            </linearGradient>
          </defs>

          <!-- 背景引导虚线 (只有在激活时显示) -->
          <line v-if="activeYear" 
            :x1="activeYearX" y1="0" 
            :x2="activeYearX" y2="100%" 
            stroke="rgba(142, 104, 47, 0.2)" 
            stroke-width="1" 
            stroke-dasharray="4,4" 
            class="guiding-line"
          />

          <!-- 画作折线 -->
          <path :d="paintingsPath" fill="none" stroke="url(#line-grad-paint)" stroke-width="3" 
            filter="url(#ink-filter)" class="line-path ink-line" />

          <!-- 书法折线 -->
          <path :d="calligraphyPath" fill="none" stroke="#8e682f" stroke-width="2" 
            filter="url(#ink-filter)" opacity="0.7" class="line-path ink-line" />
            
          <!-- 交互点：点击跳转 -->
          <circle v-for="pt in interpolatedPoints" :key="'peak-'+pt.year"
            :cx="pt.x" :cy="pt.yPaintings" r="6" 
            fill="transparent" class="peak-trigger"
            @click="jumpToYear(pt.year)"
          >
            <title>{{ pt.year }}年作品量</title>
          </circle>
        </svg>
      </div>

      <div class="timeline-column-wrapper" :style="{ width: chartWidth + 'px' }">
        <!-- 镜像动态轴点：仅保留随年份移动的涟漪 -->
        <div v-if="activeYear" class="axis-ripple-container" 
          :style="{ left: (yearBasePositions[activeYear]) + 'px' }">
          <div class="axis-active-node">
            <div class="node-ripple"></div>
          </div>
        </div>

        <!-- 时代背景层 -->
        <div class="era-backgrounds">
          <div v-for="era in eraBlocks" :key="era.name" class="era-block"
            :style="{ left: era.left + 'px', width: era.width + 'px', backgroundColor: era.color }">
            <span class="era-name">{{ era.name }}</span>
          </div>
        </div>

        <div class="timeline-column" v-for="(yearItem, index) in yearNodes" :key="yearItem.year"
          :style="{ left: (index * yearSpacing + 20) + 'px', transform: `translateX(${getYearOffset(yearItem.year)}px)` }">
          <!-- 年份节点 -->
          <div class="year-node" @mouseenter="showYearTooltip(yearItem.year, $event)" @mouseleave="hideYearTooltip()">
            <!-- 共鸣光圈 (当一年内同时有生平和史事时) -->
            <div v-if="hasResonance(yearItem.year)" class="resonance-ring"></div>
            
            <div class="year-circle" 
              :class="{ 
                'decade-circle': yearItem.isDecade, 
                'has-production': getYearWorkCount(yearItem.year) > 0,
                'is-active': activeYear === yearItem.year
              }"
              :style="{ transform: `scale(${getYearCircleScale(yearItem.year)})` }"></div>
            <span v-if="yearItem.isDecade" class="decade-year">{{ yearItem.year }}</span>
          </div>

          <!-- 内容区 - 分为固定的上下两部分 -->
          <div class="content-wrapper" v-if="hasContent(yearItem.year)">
            <!-- 上方：生平事件区域 -->
            <div class="content-area biography-area" :class="{ 'no-content': !hasBiographyEvents(yearItem.year) }">
              <div class="content-list" v-if="hasBiographyEvents(yearItem.year)">
                <!-- 生平事件 -->
                <div class="content-item biography-item" v-for="event in getBiographyEventsByYear(yearItem.year)"
                  :key="'bio' + event.timeline_id"
                  :class="{ 'is-resonant': activeYear === yearItem.year }"
                  @mouseenter="setActiveEvent(yearItem.year, 'bio' + event.timeline_id)"
                  @mouseleave="clearActiveEvent()">
                  <div class="content-title biography-title">{{ event.event_title }}</div>
                  <div class="detail-container" :data-event-id="'bio' + event.timeline_id"
                    :class="{ expanded: activeYear === yearItem.year && activeId === 'bio' + event.timeline_id }">
                    <!-- 外部边框 -->
                    <div class="detail-outline"></div>
                    <!-- 内部滚动容器 -->
                    <div class="detail-scroll-container">
                      <!-- 内边框 -->
                      <div class="detail-inner-border"></div>
                      <!-- 水平标题：优化阅读体验 -->
                      <div class="detail-header">
                        <span class="detail-tag tag-bio">生平</span>
                        <h3 class="detail-title">{{ event.event_title }}</h3>
                      </div>
                      <!-- 实际内容 -->
                      <div class="event-detail">{{ event.detail }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 下方：历史事件区域 -->
            <div class="content-area historical-area" :class="{ 'no-content': !hasHistoricalEvents(yearItem.year) }">
              <div class="content-list" v-if="hasHistoricalEvents(yearItem.year)">
                <!-- 历史事件 -->
                <div class="content-item historical-item" v-for="event in getHistoricalEventsByYear(yearItem.year)"
                  :key="'his' + event.historical_event_id"
                  :class="{ 'is-resonant': activeYear === yearItem.year }"
                  @mouseenter="setActiveEvent(yearItem.year, 'his' + event.historical_event_id)"
                  @mouseleave="clearActiveEvent()">
                  <div class="content-title historical-title">{{ event.event_title }}</div>
                  <div class="detail-container" :data-event-id="'his' + event.historical_event_id"
                    :class="{ expanded: activeYear === yearItem.year && activeId === 'his' + event.historical_event_id }">
                    <!-- 外部边框 -->
                    <div class="detail-outline"></div>
                    <!-- 内部滚动容器 -->
                    <div class="detail-scroll-container">
                      <!-- 内边框 -->
                      <div class="detail-inner-border"></div>
                      <!-- 水平标题：优化阅读体验 -->
                      <div class="detail-header">
                        <span class="detail-tag tag-his">史事</span>
                        <h3 class="detail-title">{{ event.event_title }}</h3>
                      </div>
                      <!-- 实际内容 -->
                      <div class="event-detail">{{ event.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gsap from 'gsap';

export default {
  name: "TimelinePage",
  data() {
    return {
      startYear: 1865,
      endYear: 1955,
      isScrollingToShowDetail: false,
      activeTooltipYear: null,
      activeYear: null,
      activeId: null,
      showYearTooltipFlag: false,

      tooltipPos: { x: 0, y: 0 },

      // 动画相关状态
      shiftProgress: 0, 
      lastActiveYear: null,

      // 生平事件数据
      biographyEvents: [
        { timeline_id: 1, year: 1865, event_title: "出生", detail: "1月27日（农历元旦子时）生于浙江金华铁岭头。原名黄质，字朴存" },
        { timeline_id: 2, year: 1871, event_title: "早期引导", detail: "族中翰林黄崇惺（次蓀）道经金华，为其订课程，成为早期最重要的引路人。" },
        { timeline_id: 3, year: 1876, event_title: "返乡应试", detail: "随父返安徽歙县应童子试，名列前茅，开始接触乡邦文物与收藏" },
        { timeline_id: 4, year: 1886, event_title: "补廪生成家", detail: "返歙补廪生。娶洪四果为妻。问学于经学大家汪仲伊。" },
        { timeline_id: 5, year: 1888, event_title: "游学南京扬州", detail: "游学南京、扬州。拜谒杨仁山、杨长年、甘元焕。" },
        { timeline_id: 6, year: 1890, event_title: "制墨研艺", detail: "1890-1900年代：协助父亲以'易水法'制墨，深研墨性。" },
        { timeline_id: 7, year: 1907, event_title: "人生转折", detail: "被迫出走上海。加入'国学保存会'。" },
        { timeline_id: 8, year: 1909, event_title: "定居上海", detail: "正式定居上海，开始其职业编辑与著述生涯。" },
        { timeline_id: 9, year: 1911, event_title: "编辑出版", detail: "《美术丛书》开始出版，系统整理中国古典艺术文献。" },
        { timeline_id: 10, year: 1912, event_title: "发起组织贞社", detail: "发起组织'贞社'，以研究金石书画为目的。" },
        { timeline_id: 11, year: 1915, event_title: "国际艺术交流", detail: "为古玩商史德匿编撰《中华名画》图录。" },
        { timeline_id: 12, year: 1919, event_title: "主编《美术周刊》", detail: "任《时报》副刊主编，发表《古学复兴》等重要文章。" },
        { timeline_id: 13, year: 1920, event_title: "任教与著述", detail: "陆续在各大艺术院校任教。出版《古画微》、《画学通论》等。" },
        { timeline_id: 14, year: 1928, event_title: "改组神州国光社", detail: "参与改组'神州国光社'，任美术部主任。" },
        { timeline_id: 15, year: 1934, event_title: "道咸画学理论", detail: "发表《致治以文说》，标志其'道咸画学中兴'理论成熟。" },
        { timeline_id: 16, year: 1937, event_title: "鉴定故宫藏画", detail: "应北平古物陈列所之邀，赴京鉴定故宫藏画。滞留北平十年。" },
        { timeline_id: 17, year: 1938, event_title: "黑宾虹时期", detail: "画风大变，进入'黑宾虹'时期，笔墨层层积染，达于'浑厚华滋'之境。" },
        { timeline_id: 18, year: 1943, event_title: "八十寿辰画展", detail: "在北平举办八十寿辰画展，傅雷在上海为其筹办展览。" },
        { timeline_id: 19, year: 1948, event_title: "南下任教杭州", detail: "应杭州国立艺术专科学校之聘，南下任教，定居杭州栖霞岭。" },
        { timeline_id: 20, year: 1953, event_title: "人民艺术家称号", detail: "被授予'人民艺术家'称号。同年，任民族美术研究所所长。" },
        { timeline_id: 21, year: 1954, event_title: "华东美协副主席", detail: "赴上海出席华东美术家协会成立大会，当选副主席。" },
        { timeline_id: 22, year: 1955, event_title: "逝世", detail: "3月25日，在杭州病逝。遗嘱将藏品与作品万余件捐献给国家。" }
      ],

      // 历史事件数据
      historicalEvents: [
        { historical_event_id: 1, year: 1871, event_title: "洋务运动", description: "1870年代起，清廷推行'自强''求富'改革。" },
        { historical_event_id: 2, year: 1894, event_title: "甲午战争", description: "1894-1895年：中日甲午战争，中国战败。" },
        { historical_event_id: 3, year: 1898, event_title: "戊戌变法", description: "光绪帝推行戊戌变法，试图进行政治改革。" },
        { historical_event_id: 4, year: 1900, event_title: "八国联军侵华", description: "义和团运动与八国联军侵华，签订《辛丑条约》。" },
        { historical_event_id: 5, year: 1905, event_title: "废除科举制度", description: "清政府宣布废除延续1300多年的科举制度。" },
        { historical_event_id: 6, year: 1910, event_title: "白话文运动", description: "1910年代起，胡适、鲁迅等推动白话文取代文言文。" },
        { historical_event_id: 7, year: 1911, event_title: "辛亥革命", description: "武昌起义爆发，标志着辛亥革命的开始。" },
        { historical_event_id: 8, year: 1912, event_title: "中华民国成立", description: "孙中山在南京就任临时大总统。" },
        { historical_event_id: 9, year: 1915, event_title: "新文化运动", description: "倡导'民主'与'科学'，反对旧文化。" },
        { historical_event_id: 10, year: 1919, event_title: "五四运动", description: "因巴黎和会外交失败爆发的爱国运动。" },
        { historical_event_id: 11, year: 1921, event_title: "中国共产党成立", description: "在上海召开第一次全国代表大会。" },
        { historical_event_id: 12, year: 1926, event_title: "北伐战争", description: "1926-1928年：国民革命军开始北伐。" },
        { historical_event_id: 13, year: 1931, event_title: "九一八事变", description: "日本关东军发动九一八事变，开始侵占东北。" },
        { historical_event_id: 14, year: 1932, event_title: "一二八事变", description: "日本海军陆战队进攻上海闸北。" },
        { historical_event_id: 15, year: 1934, event_title: "红军长征", description: "中国工农红军开始长征，进行战略转移。" },
        { historical_event_id: 16, year: 1937, event_title: "七七事变", description: "卢沟桥事变爆发，日本全面侵华开始。" },
        { historical_event_id: 17, year: 1945, event_title: "抗日战争胜利", description: "日本宣布无条件投降，抗战取得完全胜利。" },
        { historical_event_id: 18, year: 1949, event_title: "新中国成立", description: "毛泽东宣布中华人民共和国中央人民政府成立。" },
        { historical_event_id: 19, year: 1950, event_title: "土地改革与抗美援朝", description: "废除封建土地所有制。志愿军赴朝鲜作战。" },
        { historical_event_id: 20, year: 1953, event_title: "社会主义改造", description: "开始对农业、手工业和资本主义工商业进行改造。" },
        { historical_event_id: 22, year: 1914, event_title: "第一次世界大战", description: "1914-1918年：第一次世界大战爆发。" },
        { historical_event_id: 23, year: 1917, event_title: "俄国十月革命", description: "俄国爆发十月革命。" },
        { historical_event_id: 24, year: 1939, event_title: "第二次世界大战", description: "1939-1945年：第二次世界大战全面爆发。" },
        { historical_event_id: 25, year: 1947, event_title: "冷战格局形成", description: "美苏对立加剧，两极格局形成。" }
      ],

      // 统计数据
      statsTotalData: [
        { year: 1865, calligraphy: 0, paintings: 0 },
        { year: 1870, calligraphy: 0, paintings: 1 },
        { year: 1875, calligraphy: 0, paintings: 2 },
        { year: 1880, calligraphy: 0, paintings: 3 },
        { year: 1885, calligraphy: 1, paintings: 4 },
        { year: 1890, calligraphy: 1, paintings: 5 },
        { year: 1895, calligraphy: 2, paintings: 7 },
        { year: 1900, calligraphy: 3, paintings: 9 },
        { year: 1905, calligraphy: 3, paintings: 10 },
        { year: 1907, calligraphy: 3, paintings: 5 },
        { year: 1910, calligraphy: 4, paintings: 12 },
        { year: 1915, calligraphy: 4, paintings: 15 },
        { year: 1920, calligraphy: 5, paintings: 18 },
        { year: 1925, calligraphy: 6, paintings: 22 },
        { year: 1930, calligraphy: 7, paintings: 25 },
        { year: 1933, calligraphy: 5, paintings: 15 },
        { year: 1935, calligraphy: 8, paintings: 28 },
        { year: 1940, calligraphy: 9, paintings: 32 },
        { year: 1945, calligraphy: 10, paintings: 20 },
        { year: 1950, calligraphy: 12, paintings: 35 },
        { year: 1955, calligraphy: 15, paintings: 40 }
      ],
      yearSpacing: 76,
      chartHeight: 120,
      chartTop: 0,
      shiftOffset: 360,
    };
  },

  computed: {
    maxDataValue() {
      let max = 0;
      this.statsTotalData.forEach(item => { max = Math.max(max, item.calligraphy, item.paintings); });
      return max || 20;
    },
    yearNodes() {
      const nodes = [];
      for (let y = this.startYear; y <= this.endYear; y++) nodes.push({ year: y, isDecade: y % 10 === 0 });
      return nodes;
    },
    chartWidth() { return this.yearNodes.length * this.yearSpacing + this.shiftOffset; },
    yearBasePositions() {
      const positions = {};
      this.yearNodes.forEach((node, index) => { positions[node.year] = (index * this.yearSpacing) + (this.yearSpacing / 2); });
      return positions;
    },
    interpolatedPoints() {
      const points = [];
      const yearToData = {};
      this.statsTotalData.forEach(item => yearToData[item.year] = item);
      this.yearNodes.forEach((node) => {
        const yearData = yearToData[node.year] || { calligraphy: 0, paintings: 0 };
        const x = this.yearBasePositions[node.year] + this.getYearOffset(node.year);
        const calculateY = (val) => {
          if (val === 0) return this.chartTop + this.chartHeight - 10;
          const usableHeight = this.chartHeight - 30;
          return this.chartTop + (1 - val / this.maxDataValue) * usableHeight + 10;
        };
        points.push({ year: node.year, x: x, yPaintings: calculateY(yearData.paintings), yCalligraphy: calculateY(yearData.calligraphy) });
      });
      return points;
    },
    paintingsPath() { return this.generateSmoothPath(this.interpolatedPoints.map(p => ({ x: p.x, y: p.yPaintings }))); },
    calligraphyPath() { return this.generateSmoothPath(this.interpolatedPoints.map(p => ({ x: p.x, y: p.yCalligraphy }))); },
    eraBlocks() {
      const eraConfigs = [
        { name: "晚清时期", start: 1865, end: 1911, color: "rgba(0,0,0,0.03)" },
        { name: "民国时期", start: 1912, end: 1948, color: "rgba(142, 104, 47, 0.04)" },
        { name: "新中国时期", start: 1949, end: 1955, color: "rgba(192, 57, 43, 0.03)" }
      ];
      return eraConfigs.map(era => {
        const left = (era.start - this.startYear) * this.yearSpacing;
        const width = (era.end - era.start + 1) * this.yearSpacing;
        return { ...era, left, width };
      });
    },
    activeYearX() {
      if (!this.activeYear) return 0;
      return this.yearBasePositions[this.activeYear];
    },
  },

  methods: {
    getYearWorkCount(year) {
      const data = this.statsTotalData.find(d => d.year === year);
      return data ? (data.paintings + data.calligraphy) : 0;
    },
    hasResonance(year) { return this.hasBiographyEvents(year) && this.hasHistoricalEvents(year); },
    getYearCircleScale(year) {
      const count = this.getYearWorkCount(year);
      if (count === 0) return 1;
      return Math.min(1 + (count / this.maxDataValue) * 0.8, 2.0);
    },
    jumpToYear(year) {
      const container = this.$refs.timelineContainer;
      if (container) gsap.to(container, { scrollLeft: (year - this.startYear) * this.yearSpacing, duration: 1, ease: "power2.inOut" });
    },
    generateSmoothPath(points) {
      if (points.length < 2) return '';
      let path = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]; const curr = points[i];
        const cp1x = prev.x + (curr.x - prev.x) / 3;
        const cp2x = curr.x - (curr.x - prev.x) / 3;
        path += ` C ${cp1x},${prev.y} ${cp2x},${curr.y} ${curr.x},${curr.y}`;
      }
      return path;
    },
    getYearOffset(year) {
      const targetYear = this.activeYear || this.lastActiveYear;
      return (targetYear && year > targetYear) ? this.shiftOffset * this.shiftProgress : 0;
    },
    setActiveEvent(year, id) {
      if (this.activeYear === year && this.activeId === id) return;
      this.activeYear = year; this.lastActiveYear = year; this.activeId = id;
      this.showYearTooltipFlag = false;
      gsap.to(this, { duration: 0.45, shiftProgress: 1, ease: "power2.out" });
      if (year >= 1953) this.scrollToShowDetail();
    },
    clearActiveEvent() {
      this.activeYear = null; this.activeId = null;
      gsap.to(this, { duration: 0.45, shiftProgress: 0, ease: "power2.out" });
    },
    scrollToShowDetail() {
      const timelineContainer = this.$refs.timelineContainer;
      if (timelineContainer) gsap.to(timelineContainer, { scrollLeft: timelineContainer.scrollLeft + 400, duration: 0.5, ease: "power2.out" });
    },
    showYearTooltip(year, e) {
      if (this.activeId) return;
      const rect = e.target.getBoundingClientRect();
      this.activeTooltipYear = year; this.showYearTooltipFlag = true;
      this.tooltipPos = { x: rect.left + rect.width / 2 - 80, y: rect.top - 120 };
    },
    hideYearTooltip() { this.showYearTooltipFlag = false; this.activeTooltipYear = null; },
    hasContent(year) { return this.hasBiographyEvents(year) || this.hasHistoricalEvents(year); },
    hasBiographyEvents(year) { return this.biographyEvents.some(e => e.year === year); },
    hasHistoricalEvents(year) { return this.historicalEvents.some(e => e.year === year); },
    getBiographyEventsByYear(year) { return this.biographyEvents.filter(e => e.year === year); },
    getHistoricalEventsByYear(year) { return this.historicalEvents.filter(e => e.year === year); },
    getCalligraphyTotal(year) { return this.statsTotalData.find(i => i.year === year)?.calligraphy || 0; },
    getPaintingsTotal(year) { return this.statsTotalData.find(i => i.year === year)?.paintings || 0; },
  },
  mounted() {
    const container = this.$refs.timelineContainer;
    if (container) {
      this._wheelHandler = (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault(); container.scrollLeft += e.deltaY * 1.5;
        }
      };
      container.addEventListener("wheel", this._wheelHandler, { passive: false });
    }
  },
  beforeUnmount() {
    if (this._wheelHandler && this.$refs.timelineContainer) this.$refs.timelineContainer.removeEventListener('wheel', this._wheelHandler);
    gsap.killTweensOf(this);
  }
};
</script>

<style scoped>
@font-face { font-family: "Xing Shu Fan Ti"; src: url('@/assets/fonts/YuWeiShuFaXingShuFanTi-1.ttf') format('truetype'); }
@font-face { font-family: "Kai Ti"; src: url('@/assets/fonts/HanYiKaiTiJian-1.ttf') format('truetype'); }

.chart-legend-fixed {
  position: fixed; top: 4vh; right: 40px; display: flex; gap: 20px;
  background-color: rgba(255, 255, 255, 0.8); padding: 8px 16px; border-radius: 8px; z-index: 999;
}
.legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.calligraphy-dot { background-color: #8e682f; }
.paintings-dot { background-color: #e67e22; }
.legend-text { font-size: 16px; color: #5a3f21; font-family: "Kai Ti", serif; }

.middle-timeline-wrapper {
  display: flex; justify-content: center; align-items: center;
  width: 100%; height: 100vh; background-image: url('@/assets/images/timeline.png');
  overflow: hidden; background-size: cover; background-position: center; padding: 0 40px; position: relative;
}

.middle-timeline-container {
  width: 100%; padding: 2vh 0; overflow-x: auto; overflow-y: hidden; white-space: nowrap; position: relative;
}

.fixed-mirror-axis {
  position: absolute; top: 35vh; left: 0; width: 100%; height: 1px;
  background: linear-gradient(to right, transparent, rgba(142, 104, 47, 0.15) 5%, rgba(142, 104, 47, 0.25) 50%, rgba(142, 104, 47, 0.15) 95%, transparent);
  z-index: 1; pointer-events: none;
}
.fixed-mirror-axis::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
  background: radial-gradient(ellipse at center, rgba(142, 104, 47, 0.05) 0%, transparent 70%); transform: translateY(-50%);
}

.event-type-labels {
  position: absolute; left: 20px; top: 35vh; transform: translateY(-50%);
  width: 40px; pointer-events: none; display: flex; flex-direction: column; z-index: 500; padding-left: 10px; border-left: 1px solid rgba(142, 104, 47, 0.15);
}
.event-type-label {
  writing-mode: vertical-rl; font-family: "Kai Ti"; font-size: 14px; font-weight: bold; opacity: 0.4;
  display: flex; align-items: center; letter-spacing: 8px;
}
.biography-label { height: 22vh; color: #8e682f; justify-content: flex-end; padding-bottom: 10px; }
.historical-label { height: 22vh; color: #654444; justify-content: flex-start; padding-top: 10px; }
.mirror-seal { height: 30px; width: 30px; display: flex; align-items: center; justify-content: center; }
.mirror-seal::after { content: ''; width: 8px; height: 8px; background-color: #c0392b; transform: rotate(45deg); box-shadow: 0 0 10px rgba(192, 57, 43, 0.5); }

.chart-lines-container {
  position: absolute; top: 6vh; left: 0; width: 100%; height: 18vh; pointer-events: none; z-index: 50;
}
.ink-line { transition: stroke-width 0.3s ease; }
.ink-line:hover { stroke-width: 5; filter: url(#ink-filter) brightness(1.1); }

.timeline-column-wrapper {
  min-width: max-content; height: 60vh; padding-left: 20px; margin-top: 22vh; position: relative; pointer-events: none;
}
.timeline-column {
  width: 36px; position: absolute; top: 0; display: flex; flex-direction: column; align-items: center;
}
.year-node { height: 6vh; position: relative; cursor: pointer; pointer-events: auto; display: flex; align-items: center; justify-content: center; }
.year-circle { width: 12px; height: 12px; border: 2px solid #7a5834; border-radius: 50%; background: #f6f4f0; transition: all 0.2s; }
.decade-year { position: absolute; top: 6.5vh; font-size: 13px; font-weight: bold; color: #5a3f21; font-family: "Kai Ti"; }

.content-wrapper { width: 38px; display: flex; flex-direction: column; position: relative; margin-top: 6vh; min-height: 50vh; }
.content-area { position: absolute; left: 0; width: 100%; }
.biography-area { top: 0; height: 22vh; display: flex; flex-direction: column; justify-content: flex-end; }
.historical-area { top: 24vh; height: 22vh; display: flex; flex-direction: column; justify-content: flex-start; }

.content-item {
  width: 38px; background: #f6f4f0; padding: 10px 4px; border-radius: 6px; cursor: pointer; position: relative; 
  transition: all .25s ease; pointer-events: auto;
}
.content-item:hover, .content-item.is-resonant { transform: translateY(-2px); background-color: #fffdf0; box-shadow: 0 4px 15px rgba(142, 104, 47, 0.3); }
.content-title { writing-mode: vertical-rl; font-size: 14px; font-weight: bold; font-family: "Kai Ti"; color: #333; text-align: center; }
.biography-title { color: #8e682f; }
.historical-title { color: #654444; }

.detail-container {
  position: absolute; left: 45px; width: 360px; background: #fffdf9; border-radius: 8px;
  transform: scaleX(0); transform-origin: left center; opacity: 0; z-index: 200;
  transition: transform 0.45s cubic-bezier(.22, .61, .36, 1), opacity 0.3s; pointer-events: none;
  border: 1px solid rgba(210, 191, 150, 0.4); overflow: hidden;
}
.detail-container.expanded { transform: scaleX(1); opacity: 1; pointer-events: auto; }
.detail-scroll-container { padding: 28px; max-height: 53vh; overflow-y: auto; mask-image: linear-gradient(to bottom, black 90%, transparent 100%); }
.detail-header { border-bottom: 1px solid rgba(210, 191, 150, 0.3); padding-bottom: 14px; margin-bottom: 18px; }
.detail-tag { display: inline-block; padding: 2px 10px; font-size: 12px; border-radius: 4px; color: #fff; font-family: "Kai Ti"; }
.tag-bio { background-color: #8e682f; }
.tag-his { background-color: #654444; }
.detail-title { font-size: 22px; color: #2c1e11; font-family: "Kai Ti"; }
.event-detail { font-size: 16px; color: #4a3a25; line-height: 1.8; text-align: justify; font-family: "Kai Ti"; }

.resonance-ring {
  position: absolute; width: 30px; height: 30px; border: 2px solid rgba(142, 104, 47, 0.3); border-radius: 50%;
  animation: pulse-ring 2s infinite; pointer-events: none;
}
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }

.global-tooltip {
  position: fixed; background: rgba(255, 253, 245, 0.98); padding: 12px 16px; border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid #d2bf96; z-index: 1000; pointer-events: none;
}

.era-backgrounds { position: absolute; top: 0; left: 0; height: 100%; pointer-events: none; z-index: 0; }
.era-block { position: absolute; top: 0; height: 100%; transition: background-color 0.5s ease; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2vh; }
.era-name { font-family: "Kai Ti", serif; font-size: 24px; color: rgba(0, 0, 0, 0.1); writing-mode: vertical-rl; text-orientation: upright; letter-spacing: 10px; }
</style>
