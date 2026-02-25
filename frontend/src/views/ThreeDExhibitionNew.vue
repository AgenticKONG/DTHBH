<template>
  <div class="exhibition-container" ref="container">
    <!-- 加载页面 -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-content">
        <div class="loading-title">黄宾虹数字艺术展</div>
        <div class="loading-subtitle">永久展厅</div>
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
        <div class="loading-progress" v-if="loadingProgress > 0">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ loadingProgress }}%</div>
        </div>
      </div>
    </div>

    <!-- 开始按钮 -->
    <div class="start-overlay" v-if="!loading && !isStarted">
      <div class="start-content">
        <h1>黄宾虹数字艺术展</h1>
        <h2>永久展厅</h2>
        <p class="start-desc">体验沉浸式3D数字展厅</p>
        <button class="start-btn" @click="startExperience" aria-label="开始参观展厅">点击进入</button>
        <div class="controls-hint">
          <p><strong>操作说明：</strong></p>
          <p>W/A/S/D 或 方向键 - 移动</p>
          <p>鼠标拖动 - 旋转视角</p>
          <p>鼠标滚轮 - 缩放</p>
          <p>点击画框 - 查看详情</p>
        </div>
      </div>
    </div>

    <!-- 展厅导航 -->
    <nav class="hall-navigation" v-if="isStarted" role="navigation" aria-label="展厅导航">
      <div class="hall-tabs">
        <button
          v-for="hall in halls"
          :key="hall.id"
          :class="['hall-tab', { active: currentHallId === hall.id }]"
          @click="switchHall(hall.id)"
          :aria-current="currentHallId === hall.id ? 'page' : undefined"
        >
          {{ hall.name }}
        </button>
      </div>
    </nav>

    <!-- 展厅信息 -->
    <div class="hall-info" v-if="isStarted && currentHall" role="region" aria-live="polite">
      <h2 class="hall-name">{{ currentHall.name }}</h2>
      <p class="hall-desc">{{ currentHall.description }}</p>
    </div>

    <!-- 操作提示 -->
    <div class="move-hint" v-if="isStarted" role="status" aria-live="polite">
      <span>WASD移动</span>
      <span>|</span>
      <span>鼠标拖动旋转</span>
      <span>|</span>
      <span>滚轮缩放</span>
      <span>|</span>
      <span>点击交互</span>
    </div>

    <!-- 展品信息弹窗 -->
    <div class="artwork-popup" v-if="activeArtwork" role="dialog" aria-modal="true" aria-labelledby="artwork-title">
      <div class="popup-content">
        <button class="popup-close" @click="closeArtwork" aria-label="关闭弹窗">×</button>
        <h3 id="artwork-title">{{ activeArtwork.title }}</h3>
        <p class="popup-year">{{ activeArtwork.year }}</p>
        <p class="popup-period">{{ activeArtwork.period }}</p>
        <p class="popup-description">{{ activeArtwork.description }}</p>
      </div>
    </div>

    <!-- 性能监控（开发模式） -->
    <div class="performance-monitor" v-if="showPerformance">
      <div class="perf-item">
        <span class="perf-label">FPS:</span>
        <span class="perf-value">{{ performance.fps }}</span>
      </div>
      <div class="perf-item">
        <span class="perf-label">内存:</span>
        <span class="perf-value">{{ performance.memoryUsage }}MB</span>
      </div>
    </div>
  </div>
</template>

<script>
import { SceneManager } from '../three/utils/SceneManager.js';
import { MaterialManager } from '../three/materials/MaterialManager.js';
import { LightManager } from '../three/lights/LightManager.js';
import { InteractionManager } from '../three/utils/InteractionManager.js';
import { HallScene } from '../three/scenes/HallScene.js';

export default {
  name: 'ThreeDExhibition',

  data() {
    return {
      loading: true,
      loadingText: '初始化中...',
      loadingProgress: 0,
      isStarted: false,
      currentHallId: 'intro',
      activeArtwork: null,
      showPerformance: process.env.NODE_ENV === 'development',

      // 展厅数据
      halls: [
        {
          id: 'intro',
          name: '序厅',
          description: '黄宾虹简介和艺术成就概览',
          sceneClass: null // 将在运行时加载
        },
        {
          id: 'early',
          name: '早期展厅',
          description: '疏淡清逸 - 宗法新安与花鸟探索',
          sceneClass: null
        },
        {
          id: 'middle',
          name: '盛期展厅',
          description: '浑厚华滋 - 五笔七墨理论大成',
          sceneClass: null
        },
        {
          id: 'late',
          name: '晚期展厅',
          description: '黑密厚重 - 艺术升华与绝笔作品',
          sceneClass: null
        },
        {
          id: 'end',
          name: '尾厅',
          description: '艺术成就总结与传承',
          sceneClass: null
        }
      ],

      // 3D系统
      sceneManager: null,
      materialManager: null,
      lightManager: null,
      interactionManager: null,

      // 性能监控
      performance: {
        fps: 0,
        frameCount: 0,
        lastTime: performance.now(),
        memoryUsage: 0
      },

      // 性能监控定时器
      performanceInterval: null
    };
  },

  computed: {
    currentHall() {
      return this.halls.find((hall) => hall.id === this.currentHallId);
    }
  },

  async mounted() {
    try {
      await this.initializeExhibition();
    } catch (error) {
      console.error('Failed to initialize exhibition:', error);
      this.loadingText = '初始化失败，请刷新重试';
    }
  },

  beforeUnmount() {
    this.cleanup();
  },

  methods: {
    /**
       * 初始化展厅
       */
    async initializeExhibition() {
      this.loadingText = '创建场景管理器...';
      this.loadingProgress = 10;

      // 创建场景管理器
      this.sceneManager = new SceneManager(this.$refs.container);
      await this.sceneManager.initialize();

      // 创建材质管理器
      this.materialManager = new MaterialManager();

      // 创建灯光管理器
      this.lightManager = new LightManager(this.sceneManager.scene);

      // 创建交互管理器
      this.interactionManager = new InteractionManager(
        this.sceneManager.camera,
        this.sceneManager.renderer,
        this.$refs.container
      );
      this.interactionManager.initialize();

      // 设置交互回调
      this.setupInteractionCallbacks();

      this.loadingText = '加载完成';
      this.loadingProgress = 100;

      // 延迟一下再显示开始按钮
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },

    /**
       * 开始体验
       */
    startExperience() {
      this.isStarted = true;

      // 启动渲染循环
      this.sceneManager.startRenderLoop();

      // 切换到序厅
      this.switchHall('intro');

      // 启动性能监控
      this.startPerformanceMonitoring();
    },

    /**
       * 切换展厅
       */
    async switchHall(hallId) {
      if (!this.sceneManager) return;

      this.loadingText = `加载${this.getHallName(hallId)}...`;
      this.loading = true;

      try {
        // 这里应该根据hallId加载对应的展厅场景类
        // 暂时使用基类作为示例
        await this.sceneManager.switchScene(HallScene, {
          name: hallId,
          displayName: this.getHallName(hallId),
          description: this.getHallDescription(hallId)
        });

        this.currentHallId = hallId;

        // 延迟隐藏加载界面
        setTimeout(() => {
          this.loading = false;
        }, 500);
      } catch (error) {
        console.error('Failed to switch hall:', error);
        this.loadingText = '加载失败，请重试';
      }
    },

    /**
       * 设置交互回调
       */
    setupInteractionCallbacks() {
      // 悬停回调
      this.interactionManager.setCallback('onHover', (object) => {
        console.log('Hovered:', object.userData);
      });

      // 点击回调
      this.interactionManager.setCallback('onClick', (object) => {
        if (object.userData.artworkId) {
          this.showArtwork(object.userData);
        }
      });

      // 双击回调
      this.interactionManager.setCallback('onDoubleClick', (object) => {
        console.log('Double clicked:', object.userData);
      });
    },

    /**
       * 显示展品信息
       */
    showArtwork(userData) {
      // 这里应该根据userData.artworkId从数据源加载展品信息
      // 暂时使用模拟数据
      this.activeArtwork = {
        title: userData.title || '未命名作品',
        year: userData.year || '未知年份',
        period: userData.period || '未知时期',
        description: userData.description || '暂无描述'
      };
    },

    /**
       * 关闭展品信息
       */
    closeArtwork() {
      this.activeArtwork = null;
    },

    /**
       * 获取展厅名称
       */
    getHallName(hallId) {
      const hall = this.halls.find((h) => h.id === hallId);
      return hall ? hall.name : '';
    },

    /**
       * 获取展厅描述
       */
    getHallDescription(hallId) {
      const hall = this.halls.find((h) => h.id === hallId);
      return hall ? hall.description : '';
    },

    /**
       * 启动性能监控
       */
    startPerformanceMonitoring() {
      this.performanceInterval = setInterval(() => {
        if (this.sceneManager) {
          const perf = this.sceneManager.getPerformance();
          this.performance = perf;
        }
      }, 1000);
    },

    /**
       * 清理资源
       */
    cleanup() {
      // 停止性能监控
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      // 销毁交互管理器
      if (this.interactionManager) {
        this.interactionManager.destroy();
        this.interactionManager = null;
      }

      // 销毁灯光管理器
      if (this.lightManager) {
        this.lightManager.clear();
        this.lightManager = null;
      }

      // 销毁材质管理器
      if (this.materialManager) {
        this.materialManager.clear();
        this.materialManager = null;
      }

      // 销毁场景管理器
      if (this.sceneManager) {
        this.sceneManager.destroy();
        this.sceneManager = null;
      }
    }
  }
};
</script>

<style scoped>
  .exhibition-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #2a1f1a;
  }

  /* 加载界面 */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #5c4033 0%, #3d2817 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loading-content {
    text-align: center;
    color: #f5f0e6;
  }

  .loading-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #ffd700;
  }

  .loading-subtitle {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.9;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 215, 0, 0.3);
    border-top-color: #ffd700;
    border-radius: 50%;
    margin: 0 auto 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 16px;
    opacity: 0.8;
  }

  .loading-progress {
    margin-top: 20px;
  }

  .progress-bar {
    width: 200px;
    height: 6px;
    background: rgba(255, 215, 0, 0.2);
    border-radius: 3px;
    margin: 0 auto 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: #ffd700;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 14px;
    color: #ffd700;
  }

  /* 开始界面 */
  .start-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(42, 31, 26, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 900;
  }

  .start-content {
    text-align: center;
    color: #f5f0e6;
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .start-content h1 {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #ffd700;
  }

  .start-content h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #f5f0e6;
  }

  .start-desc {
    font-size: 16px;
    margin-bottom: 30px;
    opacity: 0.8;
  }

  .start-btn {
    padding: 15px 50px;
    font-size: 18px;
    font-weight: bold;
    color: #3d2817;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
  }

  .start-btn:active {
    transform: translateY(0);
  }

  .controls-hint {
    margin-top: 30px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.8;
  }

  .controls-hint strong {
    color: #ffd700;
  }

  /* 展厅导航 */
  .hall-navigation {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 5px;
    backdrop-filter: blur(10px);
  }

  .hall-tabs {
    display: flex;
    gap: 5px;
  }

  .hall-tab {
    padding: 10px 20px;
    font-size: 14px;
    color: #f5f0e6;
    background: transparent;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .hall-tab:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.5);
  }

  .hall-tab.active {
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
    color: #ffd700;
    font-weight: bold;
  }

  /* 展厅信息 */
  .hall-info {
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    text-align: center;
    color: #f5f0e6;
    padding: 15px 30px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    max-width: 600px;
  }

  .hall-name {
    font-size: 24px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 8px;
  }

  .hall-desc {
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.6;
  }

  /* 操作提示 */
  .move-hint {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    display: flex;
    gap: 15px;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 20px;
    color: #f5f0e6;
    font-size: 12px;
    backdrop-filter: blur(10px);
  }

  .move-hint span {
    opacity: 0.8;
  }

  /* 展品信息弹窗 */
  .artwork-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    min-width: 400px;
    max-width: 600px;
    animation: popupIn 0.3s ease-out;
  }

  @keyframes popupIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .popup-content {
    position: relative;
    padding: 30px;
    background: linear-gradient(135deg, #5c4033 0%, #3d2817 100%);
    border: 2px solid #ffd700;
    border-radius: 10px;
    color: #f5f0e6;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }

  .popup-close {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    font-size: 24px;
    color: #ffd700;
    background: transparent;
    border: none;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: all 0.3s ease;
  }

  .popup-close:hover {
    transform: rotate(90deg);
    color: #fff;
  }

  .popup-content h3 {
    font-size: 24px;
    color: #ffd700;
    margin-bottom: 10px;
  }

  .popup-year {
    font-size: 14px;
    color: #ffd700;
    margin-bottom: 5px;
  }

  .popup-period {
    font-size: 14px;
    color: #ffd700;
    margin-bottom: 15px;
    font-style: italic;
  }

  .popup-description {
    font-size: 14px;
    line-height: 1.8;
    opacity: 0.9;
  }

  /* 性能监控 */
  .performance-monitor {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    padding: 10px 15px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 5px;
    color: #f5f0e6;
    font-size: 12px;
    backdrop-filter: blur(10px);
  }

  .perf-item {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
  }

  .perf-item:last-child {
    margin-bottom: 0;
  }

  .perf-label {
    color: #ffd700;
  }

  .perf-value {
    color: #f5f0e6;
    font-weight: bold;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .hall-navigation {
      width: 90%;
    }

    .hall-tabs {
      flex-wrap: wrap;
      justify-content: center;
    }

    .hall-tab {
      padding: 8px 15px;
      font-size: 12px;
    }

    .hall-info {
      width: 90%;
      bottom: 60px;
    }

    .hall-name {
      font-size: 20px;
    }

    .hall-desc {
      font-size: 12px;
    }

    .artwork-popup {
      min-width: 300px;
      max-width: 90%;
    }

    .popup-content {
      padding: 20px;
    }

    .move-hint {
      width: 90%;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>
