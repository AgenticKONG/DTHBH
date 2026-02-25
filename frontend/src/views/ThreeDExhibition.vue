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

    <!-- 导航工具条 -->
    <div class="navigation-toolbar" v-if="isStarted" role="toolbar" aria-label="导航工具">
      <div class="toolbar-content">
        <div class="mode-buttons">
          <button
            v-for="(name, mode) in navigationModes"
            :key="mode"
            :class="['mode-btn', { active: navigationMode === mode }]"
            @click="switchNavigationMode(mode)"
            :aria-pressed="navigationMode === mode"
            :title="name"
          >
            {{ name }}
          </button>
        </div>
        <div class="position-info" v-if="navigationMode === 'free-roam'">
          <span>X: {{ positionInfo.x.toFixed(1) }}</span>
          <span>Z: {{ positionInfo.z.toFixed(1) }}</span>
        </div>
      </div>
    </div>

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
import { IntroHall } from '../three/scenes/IntroHall.js';
import { EarlyHall } from '../three/scenes/EarlyHall.js';
import { MiddleHall } from '../three/scenes/MiddleHall.js';
import { LateHall } from '../three/scenes/LateHall.js';
import { EndHall } from '../three/scenes/EndHall.js';
import { NavigationManager } from '../three/utils/NavigationManager.js';
import { HallNavigationManager } from '../three/utils/HallNavigationManager.js';
import { EnhancedInteractionManager } from '../three/utils/EnhancedInteractionManager.js';
import { markRaw } from 'vue';

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
          sceneClass: IntroHall
        },
        {
          id: 'early',
          name: '早期展厅',
          description: '疏淡清逸 - 宗法新安与花鸟探索',
          sceneClass: EarlyHall
        },
        {
          id: 'middle',
          name: '盛期展厅',
          description: '浑厚华滋 - 五笔七墨理论大成',
          sceneClass: MiddleHall
        },
        {
          id: 'late',
          name: '晚期展厅',
          description: '黑密厚重 - 艺术升华与绝笔作品',
          sceneClass: LateHall
        },
        {
          id: 'end',
          name: '尾厅',
          description: '艺术成就总结与传承',
          sceneClass: EndHall
        }
      ],

      // 3D系统
      sceneManager: null,
      materialManager: null,
      lightManager: null,
      interactionManager: null,
      navigationManager: null,
      hallNavigationManager: null,
      enhancedInteractionManager: null,

      // 导航模式
      navigationMode: 'free-roam',
      navigationModes: {
        'free-roam': '自主漫游',
        exhibition: '展览构成',
        thumbnail: '三维缩略图'
      },

      // 位置信息
      positionInfo: {
        x: 0,
        z: 0
      },

      // 性能监控
      performance: {
        fps: 0,
        frameCount: 0,
        lastTime: performance.now(),
        memoryUsage: 0
      },

      // 性能监控定时器
      performanceInterval: null,

      // 事件监听器
      eventListeners: []
    };
  },

  computed: {
    currentHall() {
      return this.halls.find((hall) => hall.id === this.currentHallId);
    }
  },

  async mounted() {
    try {
      console.log('Starting exhibition initialization...');
      console.log('Container ref:', this.$refs.container);
      await this.initializeExhibition();
      console.log('Exhibition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize exhibition:', error);
      console.error('Error stack:', error.stack);
      this.loadingText = `初始化失败: ${error.message}`;
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
      console.log('Step 1: Creating SceneManager...');
      this.loadingText = '创建场景管理器...';
      this.loadingProgress = 10;

      // 创建场景管理器
      if (!this.$refs.container) {
        throw new Error('Container ref is null or undefined');
      }
      console.log('Container element:', this.$refs.container);
      console.log('Container dimensions:', {
        width: this.$refs.container.clientWidth,
        height: this.$refs.container.clientHeight
      });

      this.sceneManager = new SceneManager(this.$refs.container);
      console.log('SceneManager created');
      await this.sceneManager.initialize();
      console.log('SceneManager initialized');

      console.log('Step 2: Creating MaterialManager...');
      this.loadingText = '创建材质管理器...';
      this.loadingProgress = 30;

      // 创建材质管理器
      this.materialManager = new MaterialManager();
      console.log('MaterialManager created');

      console.log('Step 3: Creating LightManager...');
      this.loadingText = '创建灯光管理器...';
      this.loadingProgress = 50;

      // 创建灯光管理器
      this.lightManager = new LightManager(this.sceneManager.scene);
      console.log('LightManager created');

      console.log('Step 4: Creating InteractionManager...');
      this.loadingText = '创建交互管理器...';
      this.loadingProgress = 70;

      // 创建交互管理器
      this.interactionManager = new InteractionManager(
        this.sceneManager.camera,
        this.sceneManager.renderer,
        this.$refs.container
      );
      console.log('InteractionManager created');
      this.interactionManager.initialize();
      console.log('InteractionManager initialized');

      console.log('Step 5: Creating NavigationManager...');
      this.loadingText = '创建导航管理器...';
      this.loadingProgress = 80;

      // 创建导航管理器
      this.navigationManager = new NavigationManager(
        this.sceneManager.camera,
        this.sceneManager.scene,
        this.$refs.container
      );
      console.log('NavigationManager created');
      this.navigationManager.initialize();
      console.log('NavigationManager initialized');

      // 设置SceneManager的navigationManager
      this.sceneManager.setNavigationManager(this.navigationManager);
      console.log('SceneManager navigationManager set');

      // 设置导航边界
      this.navigationManager.setBoundaries({
        minX: -25,
        maxX: 25,
        minZ: -45,
        maxZ: 45
      });

      // 设置导航回调
      this.navigationManager.setCallback('onModeChange', (previousMode, newMode) => {
        console.log(`Navigation mode changed: ${previousMode} -> ${newMode}`);
        this.navigationMode = newMode;
      });

      this.navigationManager.setCallback('onPositionUpdate', (position) => {
        // 可以在这里更新小地图或其他UI
      });

      console.log('Step 6: Creating HallNavigationManager...');
      this.loadingText = '创建展厅导航管理器...';
      this.loadingProgress = 85;

      // 创建展厅导航管理器
      this.hallNavigationManager = new HallNavigationManager(this.sceneManager);
      console.log('HallNavigationManager created');
      this.hallNavigationManager.initialize(this.halls);
      console.log('HallNavigationManager initialized');

      // 设置展厅导航回调
      this.hallNavigationManager.setCallback('onHallSwitch', (hallId) => {
        console.log(`Hall switch requested: ${hallId}`);
        this.switchHall(hallId);
      });

      console.log('Step 7: Creating EnhancedInteractionManager...');
      this.loadingText = '创建增强交互管理器...';
      this.loadingProgress = 90;

      // 创建增强交互管理器
      this.enhancedInteractionManager = new EnhancedInteractionManager(
        this.sceneManager.camera,
        this.sceneManager.renderer,
        this.$refs.container
      );
      console.log('EnhancedInteractionManager created');
      this.enhancedInteractionManager.initialize();
      console.log('EnhancedInteractionManager initialized');

      // 设置增强交互回调
      this.enhancedInteractionManager.setCallback('onClick', (object) => {
        console.log('Object clicked:', object.userData);
        if (object.userData.hallId && object.userData.type === 'entrance-marker') {
          this.switchHall(object.userData.hallId);
        }
      });

      this.enhancedInteractionManager.setCallback('onDoubleClick', (object) => {
        console.log('Object double-clicked:', object.userData);
      });

      this.enhancedInteractionManager.setCallback('onHallSwitch', (hallIndex) => {
        const hall = this.halls[hallIndex - 1];
        if (hall) {
          this.switchHall(hall.id);
        }
      });

      console.log('Step 8: Setting up interaction callbacks...');
      this.loadingText = '设置交互回调...';
      this.loadingProgress = 95;

      // 设置交互回调
      this.setupInteractionCallbacks();

      // 设置键盘事件监听器（用于快捷键）
      this.setupKeyboardListeners();

      this.loadingText = '加载完成';
      this.loadingProgress = 100;

      console.log('Step 9: Showing start button...');
      // 延迟一下再显示开始按钮
      setTimeout(() => {
        this.loading = false;
        console.log('Loading complete, start button should be visible');
      }, 500);
    },

    /**
       * 设置键盘事件监听器
       */
    setupKeyboardListeners() {
      const keydownHandler = (event) => {
        // 将事件传递给增强交互管理器
        if (this.enhancedInteractionManager) {
          this.enhancedInteractionManager.handleKeyDown(event);
        }
      };

      document.addEventListener('keydown', keydownHandler);
      this.eventListeners.push({ type: 'keydown', handler: keydownHandler });
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
        // 获取展厅配置
        const hall = this.halls.find((h) => h.id === hallId);
        if (!hall) {
          throw new Error(`Hall not found: ${hallId}`);
        }

        // 使用展厅的场景类，如果没有则使用基类
        const SceneClass = hall.sceneClass || HallScene;

        // 切换场景
        await this.sceneManager.switchScene(SceneClass, {
          name: hallId,
          displayName: hall.name,
          description: hall.description
        });

        this.currentHallId = hallId;

        // 注册当前展厅的交互对象
        this.registerInteractiveObjects();

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
       * 注册交互对象
       */
    registerInteractiveObjects() {
      if (!this.enhancedInteractionManager || !this.sceneManager.currentScene) {
        return;
      }

      // 清空之前的交互对象
      this.enhancedInteractionManager.clearInteractableObjects();

      // 从当前场景中收集所有可交互的对象
      const currentScene = this.sceneManager.currentScene;
      if (currentScene.objects && Array.isArray(currentScene.objects)) {
        currentScene.objects.forEach(({ object }) => {
          if (object.userData && (object.userData.interactable || object.userData.interactive)) {
            this.enhancedInteractionManager.addInteractableObject(object);
          }
        });
      }

      console.log(`Registered ${this.enhancedInteractionManager.interactableObjects.length} interactive objects`);
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
       * 切换导航模式
       */
    switchNavigationMode(mode) {
      if (!this.navigationManager) return;

      this.navigationManager.switchMode(mode);
      this.navigationMode = mode;

      // 根据模式显示不同的UI
      if (mode === 'exhibition' && this.hallNavigationManager) {
        this.hallNavigationManager.showNavigationUI();
      } else if (this.hallNavigationManager) {
        this.hallNavigationManager.hideNavigationUI();
      }

      if (mode === 'thumbnail' && this.hallNavigationManager) {
        this.hallNavigationManager.showThumbnails();
      } else if (this.hallNavigationManager) {
        this.hallNavigationManager.hideThumbnails();
      }
    },

    /**
       * 更新位置信息
       */
    updatePositionInfo() {
      if (this.sceneManager && this.sceneManager.camera) {
        this.positionInfo.x = this.sceneManager.camera.position.x;
        this.positionInfo.z = this.sceneManager.camera.position.z;
      }
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

        // 更新位置信息
        this.updatePositionInfo();
      }, 1000);
    },

    /**
       * 清理资源
       */
    cleanup() {
      // 移除事件监听器
      this.eventListeners.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler);
      });
      this.eventListeners = [];

      // 停止性能监控
      if (this.performanceInterval) {
        clearInterval(this.performanceInterval);
        this.performanceInterval = null;
      }

      // 销毁增强交互管理器
      if (this.enhancedInteractionManager) {
        this.enhancedInteractionManager.destroy();
        this.enhancedInteractionManager = null;
      }

      // 销毁展厅导航管理器
      if (this.hallNavigationManager) {
        this.hallNavigationManager.destroy();
        this.hallNavigationManager = null;
      }

      // 销毁导航管理器
      if (this.navigationManager) {
        this.navigationManager.destroy();
        this.navigationManager = null;
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

  /* 导航工具条 */
  .navigation-toolbar {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    padding: 10px 20px;
    backdrop-filter: blur(10px);
  }

  .toolbar-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .mode-buttons {
    display: flex;
    gap: 5px;
  }

  .mode-btn {
    padding: 8px 16px;
    font-size: 13px;
    color: #f5f0e6;
    background: transparent;
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mode-btn:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.5);
  }

  .mode-btn.active {
    background: rgba(255, 215, 0, 0.3);
    border-color: #ffd700;
    color: #ffd700;
    font-weight: bold;
  }

  .position-info {
    display: flex;
    gap: 15px;
    font-size: 12px;
    color: #f5f0e6;
    font-family: monospace;
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
