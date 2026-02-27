/**
 * 3D场景管理器基类
 *
 * 职责:
 * - 管理Three.js场景、相机、渲染器
 * - 处理场景初始化、切换、销毁
 * - 管理场景资源加载和释放
 * - 提供渲染循环
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { markRaw } from 'vue';
import { gsap } from 'gsap';

export class SceneManager {
  constructor(container) {
    if (!container) {
      throw new Error('SceneManager requires a container element');
    }

    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    this.isInitialized = false;
    this.currentScene = null;
    this.isTransitioning = false; // 场景切换状态

    // 事件监听器
    this.eventListeners = [];

    // 资源管理
    this.resources = new Map(); // 资源缓存
    this.loadingQueue = []; // 加载队列
    this.isLoading = false;

    // 场景配置
    this.config = {
      backgroundColor: 0x2a1f1a,
      cameraFOV: 75,
      cameraNear: 1, // 增大近裁剪面
      cameraFar: 1000,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      enableShadows: true,
      shadowMapType: THREE.PCFSoftShadowMap,
      // 场景切换配置
      transitionDuration: 1.0, // 过渡动画时长（秒）
      fadeOutDuration: 0.5, // 淡出时长
      fadeInDuration: 0.5 // 淡入时长
    };

    // 导航管理器（可选）
    this.navigationManager = null;

    // 性能监控
    this.performance = {
      fps: 0,
      frameCount: 0,
      lastTime: performance.now(),
      memoryUsage: 0
    };
  }

  /**
   * 初始化场景
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('SceneManager is already initialized');
      return;
    }

    try {
      // 创建场景
      this.scene = markRaw(new THREE.Scene());
      this.scene.background = new THREE.Color(this.config.backgroundColor);

      // 创建相机
      this.camera = this.createCamera();

      // 创建渲染器
      this.renderer = this.createRenderer();
      this.container.appendChild(this.renderer.domElement);

      // 创建控制器
      this.controls = this.createControls();

      // 添加事件监听
      this.addEventListeners();

      // 标记为已初始化
      this.isInitialized = true;

      console.log('SceneManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SceneManager:', error);
      throw error;
    }
  }

  /**
   * 创建相机
   */
  createCamera() {
    const { width, height } = this.getContainerSize();
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(
      this.config.cameraFOV,
      aspect,
      this.config.cameraNear,
      this.config.cameraFar
    );

    // 设置初始相机位置
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  /**
   * 创建渲染器
   */
  createRenderer() {
    const { width, height } = this.getContainerSize();

    const renderer = new THREE.WebGLRenderer({
      antialias: this.config.antialias,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 启用阴影（优化配置）
    if (this.config.enableShadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false; // 手动更新阴影，提高性能
      renderer.shadowCameraNear = 0.5;
      renderer.shadowCameraFar = 50;
    }

    // 设置色调映射
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 性能优化设置
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // 确保正确清除渲染
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    renderer.autoClearStencil = true;
    renderer.autoClearDepth = true;

    return markRaw(renderer);
  }

  /**
   * 创建控制器
   */
  createControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;

    return markRaw(controls);
  }

  /**
   * 添加事件监听器
   */
  addEventListeners() {
    // 窗口大小变化
    const handleResize = () => this.onWindowResize();
    window.addEventListener('resize', handleResize);
    this.eventListeners.push({ type: 'resize', handler: handleResize });
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    this.eventListeners.forEach(({ type, handler }) => {
      window.removeEventListener(type, handler);
    });
    this.eventListeners = [];
  }

  /**
   * 窗口大小变化处理
   */
  onWindowResize() {
    if (!this.camera || !this.renderer) return;

    const { width, height } = this.getContainerSize();

    // 更新相机
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // 更新渲染器
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.config.pixelRatio);
  }

  /**
   * 获取容器尺寸
   */
  getContainerSize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    return { width, height };
  }

  /**
   * 切换场景
   */
  async switchScene(sceneClass, config = {}) {
    if (!this.isInitialized) {
      throw new Error('SceneManager must be initialized before switching scenes');
    }

    if (this.isTransitioning) {
      console.warn('Scene transition is already in progress');
      return;
    }

    this.isTransitioning = true;

    try {
      // 淡出当前场景
      if (this.currentScene) {
        await this.fadeOutScene();
        await this.currentScene.destroy();
        this.currentScene = null;
      }

      // 清理场景
      this.clearScene();

      // 创建新场景
      const scene = new sceneClass(this, config);
      await scene.initialize();

      // 设置为当前场景
      this.currentScene = scene;

      // 淡入新场景
      await this.fadeInScene();

      console.log(`Switched to scene: ${sceneClass.name}`);
    } catch (error) {
      console.error('Failed to switch scene:', error);
      this.isTransitioning = false;
      throw error;
    }

    this.isTransitioning = false;
  }

  /**
   * 淡出场景
   */
  fadeOutScene() {
    return new Promise((resolve) => {
      if (!this.renderer) {
        resolve();
        return;
      }

      const duration = this.config.fadeOutDuration;
      const startOpacity = this.renderer.domElement.style.opacity || 1;

      gsap.to(this.renderer.domElement.style, {
        opacity: 0,
        duration: duration,
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  /**
   * 淡入场景
   */
  fadeInScene() {
    return new Promise((resolve) => {
      if (!this.renderer) {
        resolve();
        return;
      }

      const duration = this.config.fadeInDuration;
      this.renderer.domElement.style.opacity = 0;

      gsap.to(this.renderer.domElement.style, {
        opacity: 1,
        duration: duration,
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  /**
   * 清理场景
   */
  clearScene() {
    if (!this.scene) return;

    console.log('Clearing scene and disposing resources...');

    // 递归释放资源
    const disposeObject = (object) => {
      // 释放几何体
      if (object.geometry) {
        object.geometry.dispose();
        console.log('Disposed geometry');
      }

      // 释放材质
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            if (material.map) material.map.dispose();
            material.dispose();
          });
        } else {
          if (object.material.map) object.material.map.dispose();
          object.material.dispose();
        }
        console.log('Disposed material');
      }

      // 递归处理子对象
      if (object.children) {
        for (let i = object.children.length - 1; i >= 0; i--) {
          disposeObject(object.children[i]);
        }
      }
    };

    // 移除所有对象并释放资源
    while (this.scene.children.length > 0) {
      const object = this.scene.children[0];
      this.scene.remove(object);
      disposeObject(object);
    }

    console.log('Scene cleared successfully');
  }

  /**
   * 开始渲染循环
   */
  startRenderLoop() {
    if (this.animationId) {
      console.warn('Render loop is already running');
      return;
    }

    // 性能优化配置
    const optimization = {
      targetFPS: 60,
      minFPS: 30,
      adaptiveQuality: true
    };

    let lastFrameTime = performance.now();
    let frameTimeAccumulator = 0;
    const targetFrameTime = 1000 / optimization.targetFPS;

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      // 性能优化：自适应渲染频率
      frameTimeAccumulator += deltaTime;

      // 如果性能良好，每帧渲染
      if (this.performance.fps >= optimization.minFPS || !optimization.adaptiveQuality) {
        // 在自主漫游模式下，只使用NavigationManager，禁用OrbitControls
        if (this.navigationManager) {
          if (this.controls) {
            this.controls.enabled = false;
          }
          this.navigationManager.update(deltaTime / 1000);
        } else if (this.controls) {
          this.controls.enabled = true;
          this.controls.update();
        }

        // 更新当前场景
        if (this.currentScene && this.currentScene.update) {
          this.currentScene.update();
        }

        // 渲染
        this.renderer.render(this.scene, this.camera);
        this.renderer.info.reset(); // 重置渲染信息

        // 更新性能监控
        this.updatePerformance();
      } else {
        // 性能不足时，降低渲染频率
        if (frameTimeAccumulator >= targetFrameTime * 2) {
          frameTimeAccumulator = 0;

          // 在自主漫游模式下，只使用NavigationManager，禁用OrbitControls
          if (this.navigationManager) {
            if (this.controls) {
              this.controls.enabled = false;
            }
            this.navigationManager.update(deltaTime / 1000);
          } else if (this.controls) {
            this.controls.enabled = true;
            this.controls.update();
          }

          // 更新当前场景
          if (this.currentScene && this.currentScene.update) {
            this.currentScene.update();
          }

          // 渲染
          this.renderer.render(this.scene, this.camera);

          // 更新性能监控
          this.updatePerformance();
        }
      }
    };

    animate();
  }

  /**
   * 停止渲染循环
   */
  stopRenderLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 更新性能监控
   */
  updatePerformance() {
    this.performance.frameCount++;
    const currentTime = performance.now();
    const delta = currentTime - this.performance.lastTime;

    if (delta >= 1000) {
      this.performance.fps = Math.round((this.performance.frameCount * 1000) / delta);
      this.performance.frameCount = 0;
      this.performance.lastTime = currentTime;

      // 更新内存使用
      if (performance.memory) {
        this.performance.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
      }
    }
  }

  /**
   * 设置导航管理器
   */
  setNavigationManager(navigationManager) {
    this.navigationManager = navigationManager;
    // 设置NavigationManager的sceneManager引用
    if (navigationManager && !navigationManager.sceneManager) {
      navigationManager.sceneManager = this;
    }
  }

  /**
   * 设置灯光管理器
   */
  setLightManager(lightManager) {
    this.lightManager = lightManager;
    // 设置LightManager的sceneManager引用
    if (lightManager && !lightManager.sceneManager) {
      lightManager.sceneManager = this;
    }
  }

  /**
   * 获取性能数据
   */
  getPerformance() {
    return { ...this.performance };
  }

  /**
   * 加载资源
   */
  async loadResource(key, loader, url) {
    // 检查缓存
    if (this.resources.has(key)) {
      console.log(`Resource ${key} loaded from cache`);
      return this.resources.get(key);
    }

    // 添加到加载队列
    this.loadingQueue.push({ key, loader, url });

    // 开始加载
    if (!this.isLoading) {
      return this.processLoadingQueue();
    }
  }

  /**
   * 处理加载队列
   */
  async processLoadingQueue() {
    if (this.isLoading || this.loadingQueue.length === 0) {
      return null;
    }

    this.isLoading = true;
    const { key, loader, url } = this.loadingQueue.shift();

    try {
      const resource = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (resource) => {
            resolve(resource);
          },
          (progress) => {
            console.log(`Loading ${key}: ${(progress.loaded / progress.total) * 100}%`);
          },
          (error) => {
            console.error(`Failed to load ${key}:`, error);
            reject(error);
          }
        );
      });

      // 缓存资源
      this.resources.set(key, resource);
      console.log(`Resource ${key} loaded and cached`);

      // 继续处理队列
      this.isLoading = false;
      this.processLoadingQueue();

      return resource;
    } catch (error) {
      console.error(`Error loading resource ${key}:`, error);
      this.isLoading = false;
      this.processLoadingQueue();
      throw error;
    }
  }

  /**
   * 释放资源
   */
  releaseResource(key) {
    if (this.resources.has(key)) {
      const resource = this.resources.get(key);

      // 释放纹理
      if (resource instanceof THREE.Texture) {
        resource.dispose();
      }

      // 释放几何体
      if (resource instanceof THREE.BufferGeometry) {
        resource.dispose();
      }

      // 从缓存中移除
      this.resources.delete(key);
      console.log(`Resource ${key} released`);
    }
  }

  /**
   * 清空所有资源缓存
   */
  clearResourceCache() {
    this.resources.forEach((resource, key) => {
      if (resource instanceof THREE.Texture) {
        resource.dispose();
      } else if (resource instanceof THREE.BufferGeometry) {
        resource.dispose();
      }
    });

    this.resources.clear();
    console.log('All resources cleared from cache');
  }

  /**
   * 相机动画移动到指定位置
   */
  animateCameraTo(position, target, duration = 1.0) {
    return new Promise((resolve) => {
      // 保存当前相机目标
      const currentTarget = new THREE.Vector3();
      this.controls.target.copy(currentTarget);

      // 创建动画时间线
      const tl = gsap.timeline({
        onComplete: () => {
          resolve();
        }
      });

      // 动画相机位置
      tl.to(
        this.camera.position,
        {
          x: position.x,
          y: position.y,
          z: position.z,
          duration: duration,
          ease: 'power2.inOut'
        },
        0
      );

      // 动画相机目标
      tl.to(
        this.controls.target,
        {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: duration,
          ease: 'power2.inOut'
        },
        0
      );
    });
  }

  /**
   * 重置相机到初始位置
   */
  resetCamera() {
    this.animateCameraTo(new THREE.Vector3(0, 2, 5), new THREE.Vector3(0, 0, 0), 0.5);
  }

  /**
   * 销毁场景管理器
   */
  async destroy() {
    // 停止渲染循环
    this.stopRenderLoop();

    // 销毁当前场景
    if (this.currentScene) {
      await this.currentScene.destroy();
      this.currentScene = null;
    }

    // 清理场景
    this.clearScene();

    // 清空资源缓存
    this.clearResourceCache();

    // 移除事件监听器
    this.removeEventListeners();

    // 销毁渲染器
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }

    // 销毁控制器
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // 重置状态
    this.camera = null;
    this.scene = null;
    this.isInitialized = false;

    console.log('SceneManager destroyed');
  }
}
