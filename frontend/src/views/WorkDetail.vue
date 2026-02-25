<template>
  <div>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css  " />

    <div class="container">
      <!-- 加载状态 -->
      <div class="loading-state" v-if="status === 'loading'">
        <div class="loading-icon"><i class="fas fa-spinner"></i></div>
        <h3>加载作品信息...</h3>
        <p>请稍候，正在获取作品详情</p>
      </div>

      <!-- 错误状态 -->
      <div class="error-state" v-if="status === 'error'">
        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h3>加载失败</h3>
        <p>{{ errorMsg }}</p>
        <router-link to="/gallery" class="btn"><i class="fas fa-arrow-left"></i> 返回作品集</router-link>
      </div>

      <!-- 正常内容 -->
      <div id="artworkContent" v-if="status === 'ready'">
        <h1>{{ works.worksName }}</h1>

        <div class="photo-detail">
          <div class="photo-container">
            <img
              :src="mainImg"
              :alt="works.worksName"
              class="main-photo"
              @click="openViewer(mainImg, works.worksName)"
            />
            <div class="image-actions">
              <button class="image-btn" title="放大查看" @click="openViewer(mainImg, works.worksName)">
                <i class="fas fa-search-plus"></i>
              </button>
            </div>
          </div>

          <div class="photo-info">
            <h2 class="info-title">{{ works.worksName }}</h2>

            <div class="tags">
              <span class="tag" v-for="t in tags" :key="t" @click="goToTag(t)">{{ t }}</span>
            </div>

            <div class="info-item"><span class="info-label">作者：</span><span>黄宾虹</span></div>
            <!-- 创作年代已删除 -->
            <div class="info-item">
              <span class="info-label">尺寸：</span><span>{{ works.size || '尺寸不详' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">材质：</span><span>{{ works.material || '材质不详' }}</span>
            </div>
            <!-- 收藏机构已删除 -->
            <div class="info-item">
              <span class="info-label">艺术时期：</span><span>{{ works.artPeriod || '时不详' }}</span>
            </div>

            <div class="info-item">
              <h3 class="info-title">作品简介：</h3>
              <p class="description">{{ works.worksDesc || '暂无简介' }}</p>
            </div>
          </div>
        </div>

        <!-- 仅移动原按钮到右下角 -->
        <div class="back-to-gallery">
          <router-link to="/gallery" class="btn"><i class="fas fa-arrow-left"></i> 返回作品集</router-link>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div class="image-viewer" :class="{ active: viewerShow }" @click.self="closeViewer">
      <button class="close-viewer" @click="closeViewer">&times;</button>
      <div class="viewer-container">
        <img
          :src="viewerSrc"
          :alt="viewerAlt"
          class="viewer-image"
          :style="viewerStyle"
          @wheel.prevent="onWheel"
          @mousedown.prevent="onMouseDown"
        />
        <div class="viewer-controls">
          <button class="viewer-btn" title="放大" @click="zoomIn"><i class="fas fa-search-plus"></i></button>
          <button class="viewer-btn" title="缩小" @click="zoomOut"><i class="fas fa-search-minus"></i></button>
          <button class="viewer-btn" title="重置" @click="reset"><i class="fas fa-sync-alt"></i></button>
          <button class="viewer-btn" title="全屏" @click="toggleFullscreen"><i class="fas fa-expand"></i></button>
        </div>
        <div class="viewer-status">缩放: {{ Math.round(scale * 100) }}% | {{ viewerAlt }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkDetail',
  data() {
    return {
      status: 'loading',
      errorMsg: '',
      works: {},
      scale: 1,
      x: 0,
      y: 0,
      viewerShow: false,
      viewerSrc: '',
      viewerAlt: '',
      dragging: false,
      startX: 0,
      startY: 0,
      startTranslateX: 0,
      startTranslateY: 0
    };
  },
  computed: {
    mainImg() {
      return this.works.images?.[0]?.imgUrl || '';
    },
    tags() {
      return this.works.tags?.length ? this.works.tags : ['无标签'];
    },
    yearText() {
      return this.works.creationYear || this.works.creationTimeDetail || '年代不详';
    },
    viewerStyle() {
      return {
        transform: `translate(${this.x}px, ${this.y}px) scale(${this.scale})`,
        cursor: this.dragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      };
    }
  },
  mounted() {
    window.scrollTo(0, 0);
    this.fetchWork();
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('keydown', this.onKeyDown);
  },
  beforeUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('keydown', this.onKeyDown);
  },
  methods: {
    async fetchWork() {
      try {
        const id = this.$route.query.id || this.$route.query.works_id;
        if (!id) throw new Error('缺少作品 ID');
        const res = await fetch(`/api/works/detail?works_id=${id}`);
        const json = await res.json();
        if (json.code !== 200 || !json.data) throw new Error(json.msg || '作品不存在');
        this.works = json.data;
        document.title = `${json.data.worksName} - 数字黄宾虹`;
        this.status = 'ready';
      } catch (e) {
        this.errorMsg = e.message;
        this.status = 'error';
      }
    },
    goToTag(tag) {
      this.$router.push({ path: '/gallery', query: { tag } });
    },
    openViewer(src, alt) {
      this.viewerSrc = src;
      this.viewerAlt = alt;
      this.scale = 1;
      this.x = 0;
      this.y = 0;
      this.viewerShow = true;
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.documentElement.requestFullscreen(), 100);
    },
    closeViewer() {
      this.viewerShow = false;
      document.body.style.overflow = 'auto';
      if (document.fullscreenElement) document.exitFullscreen();
    },
    zoomIn() {
      this.scale = Math.min(this.scale * 1.2, 5);
    },
    zoomOut() {
      this.scale = Math.max(this.scale / 1.2, 0.5);
    },
    reset() {
      this.scale = 1;
      this.x = 0;
      this.y = 0;
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    onWheel(e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const old = this.scale;
      if (e.deltaY < 0) {
        this.scale = Math.min(old * 1.1, 5);
        this.x = mx * (this.scale / old - 1) + this.x * (this.scale / old);
        this.y = my * (this.scale / old - 1) + this.y * (this.scale / old);
      } else {
        this.scale = Math.max(old / 1.1, 0.5);
        this.x = mx * (this.scale / old - 1) + this.x * (this.scale / old);
        this.y = my * (this.scale / old - 1) + this.y * (this.scale / old);
      }
    },
    onMouseDown(e) {
      e.preventDefault();
      this.dragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.startTranslateX = this.x;
      this.startTranslateY = this.y;
    },
    onMouseMove(e) {
      if (!this.dragging) return;
      this.x = this.startTranslateX + (e.clientX - this.startX);
      this.y = this.startTranslateY + (e.clientY - this.startY);
    },
    onMouseUp() {
      this.dragging = false;
    },
    onKeyDown(e) {
      if (e.key === 'Escape') this.closeViewer();
      if ((e.key === ' ' || e.key === 'z') && this.mainImg) {
        e.preventDefault();
        this.openViewer(this.mainImg, this.works.worksName);
      }
    }
  }
};
</script>

<style>
  /* 仅追加定位样式，其余保持原样 */
  .back-to-gallery {
    position: fixed;
    bottom: 60px;
    right: 380px;
    z-index: 999;
  }

  /* 以下样式完全不变 */
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
  .logo {
    display: flex;
    align-items: center;
    gap: 15px;
    text-decoration: none;
  }
  .logo-icon {
    color: #d2b48c;
    font-size: 28px;
  }
  .logo-text {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  .nav-menu {
    display: flex;
    gap: 30px;
  }
  .nav-item {
    color: #f8f4e6;
    text-decoration: none;
    font-size: 16px;
    padding: 8px 15px;
    border-radius: 20px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .nav-item:hover {
    background-color: rgba(210, 180, 140, 0.3);
    color: #fff;
    transform: translateY(-2px);
  }
  .nav-item.active {
    background-color: #d2b48c;
    color: #5c4033;
  }
  .mobile-menu-btn {
    display: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
  }
  .container {
    max-width: 1200px;
    margin: 100px auto 30px;
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
    font-size: 32px;
  }
  .photo-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    background-color: #fffbf0;
    border: 1px solid #d2b48c;
    border-radius: 5px;
    padding: 20px;
  }
  .photo-container {
    flex: 1;
    min-width: 400px;
    position: relative;
  }
  .main-photo {
    width: 100%;
    height: auto;
    max-height: 600px;
    object-fit: contain;
    border: 1px solid #d2b48c;
    border-radius: 3px;
    cursor: zoom-in;
    display: block;
  }
  .image-actions {
    position: absolute;
    bottom: 15px;
    right: 15px;
    display: flex;
    gap: 10px;
  }
  .image-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(139, 69, 19, 0.8);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  .image-btn:hover {
    background-color: #8b4513;
    transform: scale(1.1);
  }
  .photo-info {
    flex: 1;
    min-width: 300px;
  }
  .info-title {
    color: #8b4513;
    border-bottom: 1px solid #d2b48c;
    padding-bottom: 5px;
    font-size: 24px;
    margin-bottom: 15px;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 15px 0;
  }
  .tag {
    background-color: #f0e6d6;
    border: 1px solid #d2b48c;
    border-radius: 12px;
    padding: 3px 10px;
    font-size: 12px;
    color: #5c4033;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .tag:hover {
    background-color: #d2b48c;
    color: #fff;
    transform: translateY(-2px);
  }
  .info-item {
    margin: 15px 0;
    line-height: 1.6;
  }
  .info-label {
    font-weight: bold;
    color: #5c4033;
    display: inline-block;
    width: 100px;
  }
  .description {
    text-align: justify;
    line-height: 1.8;
    margin-top: 15px;
  }
  .action-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }
  .btn {
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
    text-decoration: none;
  }
  .btn:hover {
    background-color: #a67c52;
  }
  .image-viewer {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 2000;
    align-items: center;
    justify-content: center;
  }
  .image-viewer.active {
    display: flex;
  }
  .viewer-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  .viewer-image {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    cursor: grab;
    user-select: none;
    -webkit-user-drag: none;
  }
  .viewer-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
  }
  .viewer-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(210, 180, 140, 0.8);
    border: none;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  .viewer-btn:hover {
    background-color: #d2b48c;
    transform: scale(1.1);
  }
  .close-viewer {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: rgba(210, 180, 140, 0.8);
    border: none;
    color: #333;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  .close-viewer:hover {
    background-color: #d2b48c;
    transform: scale(1.1);
  }
  .viewer-status {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
  }
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block;
    }
    .nav-menu {
      display: none;
      position: absolute;
      top: 70px;
      left: 0;
      width: 100%;
      background-color: rgba(139, 69, 19, 0.98);
      flex-direction: column;
      padding: 20px;
      gap: 15px;
    }
    .nav-menu.active {
      display: flex;
    }
    .photo-container,
    .photo-info {
      min-width: 100%;
    }
    h1 {
      font-size: 24px;
    }
    .info-title {
      font-size: 20px;
    }
  }
  .loading-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }
  .loading-icon {
    font-size: 60px;
    color: #d2b48c;
    margin-bottom: 20px;
    animation: spin 2s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .error-state {
    text-align: center;
    padding: 60px 20px;
    color: #d32f2f;
  }
  .error-icon {
    font-size: 60px;
    color: #d32f2f;
    margin-bottom: 20px;
  }
</style>
