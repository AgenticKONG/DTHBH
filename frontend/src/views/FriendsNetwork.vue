<template>
  <div class="container-fluid">
    <!-- 1. 顶部留白：收窄间距 -->
    <div class="header-spacer"></div>

    <!-- 全局定义 -->
    <svg style="position: absolute; width: 0; height: 0;" aria-hidden="true">
      <defs>
        <filter id="ink-river-soft">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="ink-spread-ya">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.07" numOctaves="4" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="diffused" />
          <feGaussianBlur in="diffused" stdDeviation="0.5" result="soft-edge" />
          <feComponentTransfer in="soft-edge">
            <feFuncA type="linear" slope="1.2" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>

    <!-- 2. 雅致标签页 -->
    <div class="nav-tabs-ya" style="position: relative; z-index: 1000;">
      <div class="nav-tab-ya" :class="{ active: activeView === 'ink-sea-view' }" @click="activeView = 'ink-sea-view'">墨海星圖</div>
      <div class="nav-tab-ya" :class="{ active: activeView === 'sichuan-view' }" @click="switchTab('sichuan-view')">蜀游長卷</div>
      <div class="nav-tab-ya" :class="{ active: activeView === 'timeline-view' }" @click="switchTab('timeline-view')">好友時軸</div>
    </div>

    <div class="main-viewport">
      <!-- 1. 墨海星圖 (新功能，物理隔離) -->
      <div v-if="activeView === 'ink-sea-view'" class="view active">
        <InkSeaMap />
      </div>
      <!-- 蜀游专题 -->
      <div id="sichuan-view" class="view sichuan-tour-container" :class="{ active: activeView === 'sichuan-view' }">
        <div class="sichuan-h-layout">
          <div class="tour-map-top" ref="mapViewport">
            <!-- 更新后的繁体标题 -->
            <div class="map-label-ink">長江萬里圖 · 黃賓虹一九三二年入蜀紀程</div>
            <div class="map-camera" :style="cameraTransform">
              <svg id="sichuan-svg"></svg>
            </div>
          </div>
          
          <!-- 3. 下层轨道：定制滚动条 -->
          <div class="story-track-h custom-scrollbar" ref="storyTrack" @scroll="handleTourScroll" @wheel.prevent="handleWheel">
            <div class="story-canvas-width">
              <div v-for="(step, index) in sichuanData" :key="index" 
                   class="story-node-h" 
                   :class="{ 'is-active': activeStep === index }">
                <div class="tiba-card-refined" @click="scrollToStep(index)">
                  <!-- 红色印章地名：优化内边距 -->
                  <div class="tiba-stamp-red">{{ step.location }}</div>
                  
                  <div class="tiba-body">
                    <!-- 核心事件描述：第一视觉中心 -->
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
                    <div class="img-hover-hint">点击赏析</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 沉浸式卷轴鉴赏窗 -->
          <transition name="scroll-unroll">
            <div v-if="showAppreciation" class="appreciation-overlay" @click="closeAppreciation">
              <div class="appreciation-content" @click.stop>
                <!-- 模拟绫边托裱的画框 -->
                <div class="silk-mounting">
                  <div class="painting-wrap">
                    <img :src="selectedStep.image" class="full-painting" />
                    <!-- 装饰性的轴头 -->
                    <div class="scroll-axis top"></div>
                    <div class="scroll-axis bottom"></div>
                  </div>
                  
                  <!-- 竖排书法题跋区 -->
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

          <!-- 底轴 -->
          <div class="tour-ruler-final">
            <div v-for="(step, index) in sichuanData" :key="index" 
                 class="ruler-tick" 
                 :class="{ active: activeStep === index }"
                 @click="scrollToStep(index)">
              <div class="tick-dot"></div>
              <div class="tick-label">{{ step.location }}</div>
            </div>
          </div>
        </div>
      </div>

      <div id="overview-view" class="view" :class="{ active: activeView === 'overview-view' }"></div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import InkSeaMap from '../components/InkSeaMap.vue';

export default {
  name: 'JiaoyouIndex',
  components: { InkSeaMap },
  data() {
    return {
      activeView: 'ink-sea-view',
      activeStep: 0,
      mapXOffset: 0,
      showAppreciation: false,
      selectedStep: {},
      sichuanData: [
        { "date": "09.15", "location": "上海", "title": "登輪啟程", "social": "宋若嬰", "description": "中秋佳節，賓公由十六鋪登永年輪啟程入蜀，月光微輝，無限離情。", "image": "/images/huangbinhong.jpg", "x_pct": 0.95, "y_pct": 0.5 },
        { "date": "09.18", "location": "安慶", "title": "遙望九華", "social": "吳一峰", "description": "晨起遙望九華山吞吐白雲中，直是米氏潑墨，感懷家山水色之秀。", "image": "/images/shanshui.jpg", "x_pct": 0.85, "y_pct": 0.4 },
        { "date": "09.22", "location": "宜昌", "title": "川江門戶", "social": "顏承基", "description": "江闊水深之終點，正式進入川江。見“酒船”奇景，极其梦幻。", "image": "/images/shuimo.jpg", "x_pct": 0.75, "y_pct": 0.6 },
        { "date": "09.23", "location": "三峽", "title": "三峽奇險", "social": "江上縴夫", "description": "兩岸高峰限日，削壁阻流。縴夫涉水而渡，賓公嘆：此非壯遊不足以增閱歷。", "image": "/images/painting1.jpg", "x_pct": 0.65, "y_pct": 0.45 },
        { "date": "09.24", "location": "夔府", "title": "夔門大觀", "social": "亮公遺蹟", "description": "入瞿唐峽，兩山對立如門。西望風箱峽，勢極曲折，感悟造化之奇。", "image": "/images/qingshan.jpg", "x_pct": 0.55, "y_pct": 0.55 },
        { "date": "09.27", "location": "重慶", "title": "宿老古樓", "social": "王治易 / 羅希江", "description": "抵渝進城，宿老古樓川江旅社。連日賞鑒名人真蹟，確立‘筆墨第一’標准。", "image": "/images/xishan.jpg", "x_pct": 0.45, "y_pct": 0.4 },
        { "date": "10.13", "location": "犍為", "title": "狂瀾復挽", "social": "撐師", "description": "江流驟束，潛演回洑。石壁刻‘狂瀾復挽’四字，且有鐵鏈懸焉，此為川江第一險。", "image": "/images/hushan.jpg", "x_pct": 0.35, "y_pct": 0.6 },
        { "date": "10.15", "location": "樂山", "title": "爾雅台", "social": "傳度 / 趙熙", "description": "登烏尤山，觀李龍眠羅漢卷。於爾雅台憑欄遙矚，暢談佛學畫理，悟得內美。", "image": "/images/lingu.jpg", "x_pct": 0.25, "y_pct": 0.5 },
        { "date": "10.22", "location": "峨眉", "title": "雪山感悟", "social": "背子工", "description": "坐‘背子’登山。悟得‘山水無定形’之理，畫風轉向黑密厚重，積墨大成。", "image": "/images/xishanshengxiu.jpg", "x_pct": 0.15, "y_pct": 0.4 },
        { "date": "11.07", "location": "成都", "title": "少城盛宴", "social": "馮建吳 / 周稷", "description": "入蜀終點。於少城公園靜寧飯店宴請紳老及收藏家，入蜀所得悉數整理。", "image": "/images/qingcheng.jpg", "x_pct": 0.05, "y_pct": 0.5 }
      ]
    };
  },

  computed: {
    cameraTransform() { return { transform: `translateX(${-this.mapXOffset}px)` }; }
  },

  mounted() {
    if (this.activeView === 'sichuan-view') {
      this.$nextTick(() => {
        this.initSichuanTour();
        // 初始滚动到最右侧（上海站，即卷轴起始点）
        setTimeout(() => {
          const track = this.$refs.storyTrack;
          if (track) {
            track.scrollLeft = track.scrollWidth;
            // 手动触发一次滚动计算，同步笔尖位置
            this.handleTourScroll({ target: track });
          }
        }, 100);
      });
    }
  },

  methods: {
    /**
     * 切换主视图标签
     * @param {String} view - 目标视图名称
     */
    switchTab(view) {
      this.activeView = view;
      if (view === 'sichuan-view') {
        this.$nextTick(() => {
          this.initSichuanTour();
          // 初始将长卷滚动至最右端（起点：上海）
          setTimeout(() => {
            const track = this.$refs.storyTrack;
            if (track) track.scrollLeft = track.scrollWidth;
          }, 50);
        });
      }
    },

    /**
     * 初始化蜀游长卷地图（D3.js 绘制）
     * 核心逻辑：生成曲折路径、设置水墨滤镜、初始化生长动画
     */
    initSichuanTour() {
      const width = 3000, height = 220;
      const svg = d3.select('#sichuan-svg').attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      // 1. 路径插值逻辑：在核心地理节点间注入波动点，模拟自然江流
      let meanderingPoints = [];
      for (let i = 0; i < this.sichuanData.length - 1; i++) {
        const p1 = this.sichuanData[i];
        const p2 = this.sichuanData[i + 1];
        const x1 = p1.x_pct * width, y1 = p1.y_pct * height;
        const x2 = p2.x_pct * width, y2 = p2.y_pct * height;
        
        meanderingPoints.push([x1, y1]);
        
        // 两站之间插入 3 个中继点，应用正弦波动
        const segments = 3;
        for (let j = 1; j <= segments; j++) {
          const t = j / (segments + 1);
          const x = x1 + (x2 - x1) * t;
          const wave = Math.sin(t * Math.PI) * (20 + Math.sin(x * 0.01) * 15);
          const y = y1 + (y2 - y1) * t + wave;
          meanderingPoints.push([x, y]);
        }
      }
      const last = this.sichuanData[this.sichuanData.length - 1];
      meanderingPoints.push([last.x_pct * width, last.y_pct * height]);

      // 使用 Catmull-Rom 曲线让路径圆润自然
      const line = d3.line().curve(d3.curveCatmullRom.alpha(0.5));

      // 绘制底层“漫延”墨迹
      svg.append('path').attr('d', line(meanderingPoints)).attr('fill', 'none')
        .attr('stroke', '#8b7d6b').attr('stroke-width', 50).attr('stroke-opacity', 0.08)
        .attr('filter', 'url(#ink-river-soft)');

      // 绘制表层“运笔”墨迹（核心生长线）
      this.tourPath = svg.append('path').attr('d', line(meanderingPoints)).attr('fill', 'none')
        .attr('stroke', '#1a1a1a').attr('stroke-width', 3).attr('stroke-linecap', 'round')
        .attr('filter', 'url(#ink-spread-ya)');

      // 初始化路径生长遮罩 (Dasharray Hack)
      this.pathLen = this.tourPath.node().getTotalLength();
      this.tourPath.attr('stroke-dasharray', `${this.pathLen} ${this.pathLen}`).attr('stroke-dashoffset', this.pathLen);

      // 绘制地标红印与文字
      const nodes = svg.append('g').selectAll('g').data(this.sichuanData).enter().append('g');
      nodes.append('text').attr('x', d => d.x_pct * width).attr('y', d => d.y_pct * height - 20)
        .attr('style', 'font-size: 13px; fill: #8b4513; font-weight: bold; opacity: 0.6; pointer-events: none;')
        .attr('text-anchor', 'middle').text(d => d.location);

      nodes.append('rect').attr('x', d => d.x_pct * width - 6).attr('y', d => d.y_pct * height - 6)
        .attr('width', 12).attr('height', 12).attr('fill', '#c0392b').attr('rx', 2).style('cursor', 'pointer')
        .on('click', (e, d) => this.scrollToStep(this.sichuanData.indexOf(d)));

      // 初始化笔尖追踪点
      this.brushTip = svg.append('circle').attr('r', 10).attr('fill', '#1a1a1a').style('opacity', 0);
    },

    /**
     * 滚轮横向滚动支持
     */
    handleWheel(e) { this.$refs.storyTrack.scrollLeft += e.deltaY * 1.2; },

    /**
     * 处理长卷滚动联动逻辑
     * 实现：路径动态生长、笔墨提按、飞白效果、相机视口跟随
     */
    handleTourScroll(e) {
      if (!this.tourPath) return;
      const el = e.target;
      
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrollPercent = 1 - (el.scrollLeft / maxScroll);

      // 1. 方向判定：进笔（前进）vs 收笔（回溯）
      const isMovingForward = scrollPercent > (this.lastScrollPercent || 0);
      this.lastScrollPercent = scrollPercent;
      
      // 2. 速度感知逻辑
      const now = Date.now();
      const dt = now - (this.lastTime || now);
      const dx = Math.abs(el.scrollLeft - (this.lastScrollLeft || el.scrollLeft));
      const velocity = dt > 0 ? dx / dt : 0;
      this.lastTime = now;
      this.lastScrollLeft = el.scrollLeft;

      if (isMovingForward) {
        // 进笔：根据速度模拟“提按”
        const targetWidth = Math.max(1.8, Math.min(6, 4 - velocity * 1.5));
        this.tourPath.attr('stroke-width', targetWidth);
        
        // 飞白：高速运动时模拟干枯笔触
        if (velocity > 1.2) {
          this.tourPath.attr('stroke-opacity', 0.5 + Math.random() * 0.3);
          d3.select('#ink-spread-ya feDisplacementMap').attr('scale', 8); 
        } else {
          this.tourPath.attr('stroke-opacity', 1);
          d3.select('#ink-spread-ya feDisplacementMap').attr('scale', 5);
        }
        this.brushTip.attr('r', targetWidth * 2.5);
      } else {
        // 后退：回归标准实笔
        this.tourPath.attr('stroke-width', 3).attr('stroke-opacity', 1);
        d3.select('#ink-spread-ya feDisplacementMap').attr('scale', 5);
        this.brushTip.attr('r', 8);
      }
      
      // 3. 同步路径生长动画 (锁定 dasharray 防止闪烁)
      this.tourPath.attr('stroke-dasharray', `${this.pathLen},${this.pathLen}`);
      this.tourPath.attr('stroke-dashoffset', this.pathLen * (1 - scrollPercent));
      
      // 4. 定位笔尖并同步地图视口偏移
      const point = this.tourPath.node().getPointAtLength(this.pathLen * scrollPercent);
      this.brushTip.attr('cx', point.x).attr('cy', point.y).style('opacity', 1);

      const viewportW = this.$refs.mapViewport.clientWidth;
      this.mapXOffset = Math.max(0, Math.min(3000 - viewportW, point.x - viewportW / 2));
      
      // 同步当前激活步长
      this.activeStep = Math.max(0, Math.min(this.sichuanData.length - 1, Math.floor(scrollPercent * this.sichuanData.length * 0.99)));
    },

    /**
     * 平滑滚动到指定站点
     */
    scrollToStep(index) {
      const track = this.$refs.storyTrack;
      const totalScroll = track.scrollWidth - track.clientWidth;
      const targetLeft = totalScroll * (1 - (index / (this.sichuanData.length - 1)));
      track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    },

    /**
     * 开启沉浸式鉴赏窗口
     */
    openAppreciation(step) {
      this.selectedStep = step;
      this.showAppreciation = true;
    },
    
    /**
     * 关闭沉浸式鉴赏窗口
     */
    closeAppreciation() {
      this.showAppreciation = false;
    }
  }
};
</script>

<style scoped>
  .container-fluid { 
    height: 100vh; display: flex; flex-direction: column; 
    background-color: #f8f4e6; 
    background-image: url('https://www.transparenttextures.com/patterns/p6.png'); /* 极淡的纤维质感 */
    overflow: hidden; color: #3d2b1f; font-family: "Kai Ti", serif; 
  }
  
  /* 解决菜单重叠 - 预留固定导航栏高度 */
  .header-spacer { height: 72px; flex-shrink: 0; }

  .nav-tabs-ya { display: flex; justify-content: center; padding: 4px 0; margin-bottom: 2px; gap: 20px; flex-shrink: 0; }
  .nav-tab-ya { padding: 4px 15px; cursor: pointer; border-bottom: 2px solid transparent; font-size: 13px; color: #8b7d6b; }
  .nav-tab-ya.active { border-bottom: 2px solid #c0392b; color: #c0392b; font-weight: bold; }

  .main-viewport { flex: 1; overflow: hidden; position: relative; }
  .view { display: none; height: 100%; position: relative; }
  .view.active { display: block; }

  /* 蜀游专题布局 */
  .sichuan-tour-container.active { display: flex !important; flex-direction: column; }
  .sichuan-h-layout { display: flex; flex-direction: column; height: 100%; }
  
  /* 调整地图高度 */
  .tour-map-top { height: 220px; background: #f4efdf; border-bottom: 1px solid #8b4513; overflow: hidden; position: relative; flex-shrink: 0; }
  .map-camera { height: 100%; width: 3000px; }
  .map-label-ink { position: absolute; top: 12px; left: 20px; z-index: 10; font-size: 13px; color: #4a2e18; border: 1px solid #d2b48c; padding: 4px 12px; background: rgba(244,239,223,0.9); font-weight: bold; letter-spacing: 1px; box-shadow: 2px 2px 5px rgba(0,0,0,0.05); }

  /* 定制滚动条 */
  .custom-scrollbar::-webkit-scrollbar { height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f4efdf; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #8b4513; border-radius: 10px; }

  .story-track-h { flex: 1; overflow-x: scroll; overflow-y: hidden; padding: 5px 50px; background: rgba(255,255,255,0.2); scroll-behavior: smooth; display: flex; align-items: center; min-height: 185px; }
  .story-canvas-width { display: inline-flex; flex-direction: row-reverse; height: auto; }
  
  .story-node-h { width: 440px; height: 100%; display: inline-flex; align-items: center; justify-content: center; padding: 0 10px; opacity: 0.4; transition: 0.4s; }
  .story-node-h.is-active { opacity: 1; transform: scale(1.02); }

  /* 极致调优卡片高度 */
  .tiba-card-refined { 
    background: #fff; background-image: url('https://www.transparenttextures.com/patterns/parchment.png'); 
    border: 1px solid #d2b48c; border-left: 4px solid #c0392b;
    width: 420px; height: 175px; padding: 10px 15px; display: flex; gap: 15px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  .tiba-stamp-red { writing-mode: vertical-rl; background: #c0392b; color: #fff; padding: 6px 5px; font-size: 15px; font-weight: bold; border-radius: 1px; height: auto; min-height: 50px; text-align: center; line-height: 1.1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .tiba-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; }
  
  .tiba-main-event { font-size: 15px; font-weight: bold; color: #1a1a1a; line-height: 1.3; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .tiba-meta-row { display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 2px; }
  .tiba-date-tag { color: #c0392b; font-weight: bold; }
  .tiba-title-sub { color: #8b7d6b; font-style: italic; }
  
  .tiba-social-box { font-size: 11.5px; color: #8b4513; background: #fdf5e6; padding: 2px 8px; border-radius: 2px; line-height: 1.2; }
  .social-names { font-weight: bold; }

  .tiba-img-side { 
    width: 95px; height: 110px; overflow: hidden; border: 1px solid #eee; flex-shrink: 0; background: #fafafa; margin-top: 5px; 
    position: relative; cursor: zoom-in; transition: 0.3s;
  }
  .tiba-img-side:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
  .img-hover-hint { position: absolute; bottom: 0; width: 100%; background: rgba(192, 57, 43, 0.8); color: #fff; font-size: 10px; text-align: center; padding: 2px 0; opacity: 0; transition: 0.3s; }
  .tiba-img-side:hover .img-hover-hint { opacity: 1; }
  .tiba-img-side img { width: 100%; height: 100%; object-fit: cover; filter: sepia(0.2); }

  /* 沉浸式鉴赏模式 */
  .appreciation-overlay { 
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
  }
  .appreciation-content { position: relative; max-width: 90vw; display: flex; align-items: center; justify-content: center; }

  /* 模拟绫边托裱的画框效果 */
  .silk-mounting { 
    background: #fdf5e6; padding: 40px; border: 1px solid #d2b48c; 
    box-shadow: 0 20px 50px rgba(0,0,0,0.5); 
    display: flex; gap: 40px; position: relative;
    background-image: url('https://www.transparenttextures.com/patterns/p6.png'); /* 宣纸质感 */
  }
  .painting-wrap { position: relative; max-height: 80vh; border: 4px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
  .full-painting { max-height: 70vh; max-width: 50vw; object-fit: contain; }
  
  /* 轴头 */
  .scroll-axis { position: absolute; height: 30px; width: calc(100% + 40px); background: #5c4033; left: -20px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
  .scroll-axis.top { top: -35px; }
  .scroll-axis.bottom { bottom: -35px; }

  /* 竖排书法题跋 */
  .inscription-area { writing-mode: vertical-rl; padding: 20px 10px; color: #1a1a1a; font-family: "Kai Ti", serif; min-width: 150px; position: relative; }
  .ins-title { font-size: 24px; font-weight: bold; margin-left: 15px; border-left: 1px solid #c0392b; padding-left: 5px; }
  .ins-content { font-size: 18px; line-height: 1.8; height: 100%; max-height: 60vh; overflow: hidden; margin-left: 10px; }
  .ins-meta { font-size: 13px; color: #8b7d6b; margin-right: 20px; margin-top: 20px; }
  
  /* 姓名印：定位在左下角 */
  .ins-seal { 
    position: absolute; bottom: 20px; left: 10px;
    color: #c0392b; font-size: 18px; border: 2px solid #c0392b; 
    padding: 3px; font-weight: bold;
    display: grid; grid-template-columns: 1fr 1fr;
    writing-mode: vertical-rl;
    width: 44px; height: 44px;
    line-height: 1;
    text-align: center;
    box-shadow: inset 0 0 2px rgba(192, 57, 43, 0.3);
    background: rgba(192, 57, 43, 0.05);
  }

  .close-btn { position: absolute; top: -40px; right: -40px; color: #fff; font-size: 40px; cursor: pointer; transition: 0.3s; z-index: 10; }
  .close-btn:hover { color: #c0392b; transform: rotate(90deg); }

  /* 展卷动画逻辑 */
  .scroll-unroll-enter-active, .scroll-unroll-leave-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
  .scroll-unroll-enter-from, .scroll-unroll-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }

  /* 底轴 */
  .tour-ruler-final { height: 35px; display: flex; flex-direction: row-reverse; justify-content: center; align-items: center; gap: 15px; background: #f4efdf; border-top: 1px solid rgba(139, 69, 19, 0.1); flex-shrink: 0; }
  .ruler-tick { cursor: pointer; display: flex; flex-direction: column; align-items: center; opacity: 0.4; transition: 0.3s; }
  .ruler-tick.active { opacity: 1; }
  .tick-dot { width: 5px; height: 5px; background: #8b4513; border-radius: 50%; }
  .ruler-tick.active .tick-dot { background: #c0392b; transform: scale(1.4); }
  .tick-label { font-size: 9px; color: #8b4513; margin-top: 2px; }

  svg { display: block; }
</style>
