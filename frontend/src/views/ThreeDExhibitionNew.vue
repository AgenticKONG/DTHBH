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

    <!-- 导航工具条 -->
    <nav class="navigation-toolbar" v-if="isStarted" role="navigation" aria-label="导航模式">
      <div class="nav-mode-buttons">
        <button
          :class="['nav-mode-btn', { active: navigationMode === 'roam' }]"
          @click="setNavigationMode('roam')"
          :aria-pressed="navigationMode === 'roam'"
        >
          自主漫游
        </button>
        <button
          :class="['nav-mode-btn', { active: navigationMode === 'composition' }]"
          @click="setNavigationMode('composition')"
          :aria-pressed="navigationMode === 'composition'"
        >
          展览构成
        </button>
        <button
          :class="['nav-mode-btn', { active: navigationMode === 'scene' }]"
          @click="setNavigationMode('scene')"
          :aria-pressed="navigationMode === 'scene'"
        >
          三维场景
        </button>
      </div>
    </nav>

    <!-- 展厅导航（仅在自主漫游模式显示） -->
    <nav class="hall-navigation" v-if="isStarted && navigationMode === 'roam'" role="navigation" aria-label="展厅导航">
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

    <!-- 操作提示（仅自主漫游模式显示） -->
    <div class="move-hint" v-if="isStarted && navigationMode === 'roam'" role="status" aria-live="polite">
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

    <!-- 展览构成模式（三栏布局） -->
    <div class="exhibition-composition" v-if="isStarted && navigationMode === 'composition'">
      <!-- 左侧栏：厅-区域-作品列表 -->
      <div class="composition-left">
        <div class="panel-header">作品列表</div>
        <div class="hall-list">
          <div
            v-for="hall in halls"
            :key="hall.id"
            :class="['hall-item', { active: currentHallId === hall.id, hovered: hoveredItem?.type === 'hall' && hoveredItem?.id === hall.id }]"
            @click="selectHall(hall.id)"
            @mouseenter="hoverItem('hall', hall.id)"
            @mouseleave="clearHover"
          >
            <span class="hall-name">{{ hall.name }}</span>
            <span class="expand-icon">▼</span>
          </div>
        </div>
      </div>

      <!-- 中间栏：展厅地图 -->
      <div class="composition-center">
        <div class="panel-header">展厅布局</div>
        <div class="hall-map">
          <div
            v-for="hall in halls"
            :key="hall.id"
            :class="['map-hall', { active: currentHallId === hall.id, hovered: hoveredItem?.type === 'hall' && hoveredItem?.id === hall.id }]"
            @click="locateToHall(hall.id)"
            @mouseenter="hoverItem('hall', hall.id)"
            @mouseleave="clearHover"
          >
            <span class="hall-label">{{ hall.name }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧栏：展厅/作品介绍 -->
      <div class="composition-right">
        <div class="panel-header">展厅介绍</div>
        <div class="info-content" v-if="!hoveredItem || hoveredItem.type !== 'artwork'">
          <h3 class="info-title">{{ currentHall?.name }}</h3>
          <p class="info-subtitle">{{ currentHall?.description }}</p>
        </div>
        <div class="info-content artwork-info" v-else>
          <div class="artwork-thumbnail"></div>
          <h3 class="info-title">{{ getHoveredArtwork?.title }}</h3>
          <p class="info-subtitle">{{ getHoveredArtwork?.year }}</p>
          <p class="info-desc">{{ getHoveredArtwork?.description }}</p>
        </div>
      </div>
    </div>

    <!-- 三维场景模式 -->
    <div class="scene-overview" v-if="isStarted && navigationMode === 'scene'">
      <div class="scene-header">三维场景总览</div>
      <div class="scene-container">
        <div
          v-for="hall in halls"
          :key="hall.id"
          :class="['scene-hall', { active: currentHallId === hall.id }]"
          @click="locateToHall(hall.id)"
        >
          <span>{{ hall.name }}</span>
        </div>
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
import { NavigationManager } from '../three/utils/NavigationManager.js';
import { HallScene } from '../three/scenes/HallScene.js';
import { IntroHall } from '../three/scenes/IntroHall.js';
import { EarlyHall } from '../three/scenes/EarlyHall.js';
import { MiddleHall } from '../three/scenes/MiddleHall.js';
import { LateHall } from '../three/scenes/LateHall.js';
import { EndHall } from '../three/scenes/EndHall.js';

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

      // 导航模式
      navigationMode: 'roam', // roam | composition | scene

      // 展览构成模式数据
      hoveredItem: null, // { type: 'hall' | 'region' | 'artwork', id: string }
      selectedItem: null,

      // 展厅类映射
      hallClasses: {
        intro: IntroHall,
        early: EarlyHall,
        middle: MiddleHall,
        late: LateHall,
        end: EndHall
      },

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
      navigationManager: null,

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
      this.sceneManager.setLightManager(this.lightManager);

      // 创建交互管理器
      this.interactionManager = new InteractionManager(
        this.sceneManager.camera,
        this.sceneManager.renderer,
        this.$refs.container
      );
      this.interactionManager.initialize();

      // 创建导航管理器（处理WASD移动）
      this.navigationManager = new NavigationManager(
        this.sceneManager.camera,
        this.sceneManager.scene,
        this.$refs.container
      );
      this.navigationManager.initialize();

      // 设置导航管理器到场景管理器
      this.sceneManager.setNavigationManager(this.navigationManager);

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
      console.log('Starting experience, isStarted:', this.isStarted);
      this.isStarted = true;
      console.log('After setting, isStarted:', this.isStarted);

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
        // 根据 hallId 加载对应的展厅场景类
        const HallClass = this.hallClasses[hallId] || HallScene;
        
        await this.sceneManager.switchScene(HallClass, {
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
       * 设置导航模式
       */
    setNavigationMode(mode) {
      this.navigationMode = mode;
      
      // 切换到漫游模式时，恢复导航控制
      if (mode === 'roam' && this.navigationManager) {
        this.navigationManager.enable();
      } else if (this.navigationManager) {
        this.navigationManager.disable();
      }
    },

    /**
       * 悬停项目（展厅/区域/作品）
       */
    hoverItem(type, id) {
      this.hoveredItem = { type, id };
    },

    /**
       * 清除悬停状态
       */
    clearHover() {
      this.hoveredItem = null;
    },

    /**
       * 选择展厅
       */
    selectHall(hallId) {
      this.currentHallId = hallId;
    },

    /**
       * 定位到展厅（切换到漫游模式并切换展厅）
       */
    locateToHall(hallId) {
      this.setNavigationMode('roam');
      this.switchHall(hallId);
    },

    /**
       * 获取当前悬停的作品信息
       */
    getHoveredArtwork() {
      if (this.hoveredItem?.type === 'artwork') {
        return { title: '示例作品', year: '1920年', description: '这是作品描述' };
      }
      return null;
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

  /* 导航工具条 */
  .navigation-toolbar {
    position: fixed;
    bottom: 80px;
    left: 20px;
    z-index: 1000;
    background: rgba(42, 31, 26, 0.95);
    border-radius: 10px;
    padding: 8px 15px;
    backdrop-filter: blur(10px);
    border: 2px solid #ffd700;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .nav-mode-buttons {
    display: flex;
    gap: 8px;
  }

  .nav-mode-btn {
    padding: 10px 20px;
    font-size: 14px;
    color: #f5f0e6;
    background: #8b7355;
    border: 2px solid #6b5744;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .nav-mode-btn:hover {
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
    color: #ffd700;
  }

  .nav-mode-btn.active {
    background: linear-gradient(135deg, #ffd700, #c9a000);
    border-color: #ffd700;
    color: #2a1f1a;
    font-weight: bold;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
  }

  /* 展览构成模式 */
  .exhibition-composition {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    z-index: 900;
    display: flex;
    gap: 15px;
    pointer-events: auto;
  }

  .composition-left {
    width: 25%;
    min-width: 250px;
    max-width: 300px;
    background: rgba(42, 31, 26, 0.95);
    border-radius: 10px;
    padding: 15px;
    overflow-y: auto;
  }

  .composition-center {
    flex: 1;
    background: rgba(232, 224, 208, 0.95);
    border-radius: 10px;
    padding: 15px;
  }

  .composition-right {
    width: 25%;
    min-width: 250px;
    max-width: 300px;
    background: rgba(42, 31, 26, 0.95);
    border-radius: 10px;
    padding: 15px;
    overflow-y: auto;
  }

  .panel-header {
    font-size: 16px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #8b7355;
  }

  .hall-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hall-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    background: #3d2f25;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .hall-item:hover,
  .hall-item.hovered {
    background: #4a3728;
    border-color: #ffd700;
  }

  .hall-item.active {
    background: #ffd700;
    border-color: #ffd700;
  }

  .hall-item.active .hall-name {
    color: #2a1f1a;
    font-weight: bold;
  }

  .hall-item .hall-name {
    color: #f5f0e6;
    font-size: 14px;
  }

  .expand-icon {
    color: #ffd700;
    font-size: 10px;
  }

  .hall-map {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
  }

  .map-hall {
    background: #c9b896;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 3px solid transparent;
  }

  .map-hall:hover,
  .map-hall.hovered {
    background: #ffd700;
    border-color: #c9a000;
  }

  .map-hall.active {
    background: #ffd700;
    border-color: #8b7355;
  }

  .hall-label {
    color: #5c4033;
    font-weight: bold;
    font-size: 14px;
  }

  .info-content {
    color: #f5f0e6;
  }

  .info-title {
    font-size: 18px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 8px;
  }

  .info-subtitle {
    font-size: 14px;
    color: #c9b896;
    margin-bottom: 15px;
  }

  .info-desc {
    font-size: 13px;
    line-height: 1.6;
    color: #e8e0d0;
  }

  .artwork-thumbnail {
    width: 100%;
    height: 120px;
    background: #5c4033;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  /* 三维场景模式 */
  .scene-overview {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    z-index: 900;
    background: rgba(26, 26, 26, 0.95);
    border-radius: 10px;
    padding: 20px;
  }

  .scene-header {
    font-size: 20px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 20px;
    text-align: center;
  }

  .scene-container {
    width: 100%;
    height: calc(100% - 50px);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }

  .scene-hall {
    background: rgba(139, 115, 85, 0.5);
    border: 3px solid #8b7355;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .scene-hall:hover {
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
  }

  .scene-hall.active {
    background: rgba(255, 215, 0, 0.5);
    border-color: #ffd700;
  }

  .scene-hall span {
    color: #f5f0e6;
    font-size: 16px;
    font-weight: bold;
  }

  /* 展厅导航 */
  .hall-navigation {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(42, 31, 26, 0.95);
    border-radius: 10px;
    padding: 10px 20px;
    backdrop-filter: blur(10px);
    border: 2px solid #ffd700;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .hall-tabs {
    display: flex;
    gap: 5px;
  }

  .hall-tab {
    padding: 12px 24px;
    font-size: 16px;
    color: #e8e0d0;
    background: rgba(61, 47, 37, 0.8);
    border: 2px solid #8b7355;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
  }

  .hall-tab:hover {
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
    color: #ffd700;
    transform: translateY(-2px);
  }

  .hall-tab.active {
    background: linear-gradient(135deg, #ffd700, #c9a000);
    border-color: #ffd700;
    color: #2a1f1a;
    font-weight: bold;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
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
