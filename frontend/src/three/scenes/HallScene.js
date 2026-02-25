/**
 * 展厅场景基类
 *
 * 职责:
 * - 定义展厅的基本结构和属性
 * - 提供展厅初始化、渲染、销毁的通用方法
 * - 管理展厅内的墙面、地面、顶棚、画框等对象
 * - 提供展厅配置和布局
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class HallScene {
  constructor(sceneManager, config = {}) {
    this.sceneManager = sceneManager;
    this.config = {
      name: '',
      displayName: '',
      description: '',
      width: 16,
      length: 80,
      height: 12,
      backgroundColor: 0x2a1f1a,
      wallColor: 0x8b7355,
      floorColor: 0x3d2817,
      ceilingColor: 0x4a3728,
      // 动画配置
      enableIntroAnimation: true,
      introDuration: 1.5,
      // 展厅入口位置
      entrancePosition: { x: 0, y: 2, z: 10 },
      // 相机初始位置
      cameraPosition: { x: 0, y: 2, z: 10 },
      cameraTarget: { x: 0, y: 1.5, z: 0 },
      ...config
    };

    this.objects = [];
    this.lights = [];
    this.materials = {};
    this.geometries = {};
    this.textures = {};
    this.isInitialized = false;

    // 展厅布局
    this.layout = {
      areas: [],
      artworks: [],
      path: []
    };

    // 展厅状态
    this.state = {
      isLoaded: false,
      isAnimating: false,
      visibleObjects: new Set()
    };
  }

  /**
   * 初始化展厅
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn(`${this.config.name} is already initialized`);
      return;
    }

    try {
      console.log(`Initializing ${this.config.name}...`);

      // 加载展厅配置
      await this.loadConfig();

      // 设置导航边界（防止相机穿过展厅外墙）
      this.setupNavigationBoundaries();

      // 设置展厅背景
      this.setupBackground();

      // 创建展厅结构
      await this.createHallStructure();

      // 创建展品
      await this.createArtworks();

      // 创建灯光
      await this.createLights();

      // 创建交互区域
      await this.createInteractionAreas();

      // 设置相机位置
      this.setupCamera();

      // 执行入场动画
      if (this.config.enableIntroAnimation) {
        await this.playIntroAnimation();
      }

      // 标记为已初始化
      this.isInitialized = true;
      this.state.isLoaded = true;

      console.log(`${this.config.name} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize ${this.config.name}:`, error);
      throw error;
    }
  }

  /**
   * 加载展厅配置
   */
  async loadConfig() {
    // 由子类实现，用于加载特定展厅的配置
    console.log(`Loading config for ${this.config.name}`);
  }

  /**
   * 设置导航边界（防止相机穿过展厅外墙）
   */
  setupNavigationBoundaries() {
    const { sceneManager, config } = this;

    // 检查是否有导航管理器
    if (!sceneManager.navigationManager) {
      console.warn('NavigationManager not available, skipping boundary setup');
      return;
    }

    // 根据展厅尺寸设置边界
    const halfWidth = config.width / 2;
    const halfLength = config.length / 2;
    const playerRadius = sceneManager.navigationManager.collision.playerRadius;

    // 设置边界（考虑玩家半径，留出一点空间）
    const boundaries = {
      minX: -halfWidth + playerRadius,
      maxX: halfWidth - playerRadius,
      minZ: -halfLength + playerRadius,
      maxZ: halfLength - playerRadius
    };

    // 更新导航管理器的边界
    sceneManager.navigationManager.setBoundaries(boundaries);

    console.log(`Navigation boundaries set for ${this.config.name}:`, boundaries);
  }

  /**
   * 设置相机位置
   */
  setupCamera() {
    const { sceneManager, config } = this;

    // 设置相机位置
    const cameraPos = config.cameraPosition;
    const cameraTarget = config.cameraTarget;

    if (cameraPos && cameraTarget) {
      sceneManager.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
      sceneManager.controls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
      sceneManager.controls.update();
    }
  }

  /**
   * 播放入场动画
   */
  async playIntroAnimation() {
    return new Promise((resolve) => {
      const { sceneManager, config } = this;
      const duration = config.introDuration;

      console.log(`Playing intro animation for ${this.config.name}`);

      this.state.isAnimating = true;

      // 创建动画时间线
      const tl = gsap.timeline({
        onComplete: () => {
          this.state.isAnimating = false;
          resolve();
        }
      });

      // 淡入对象
      this.objects.forEach(({ object }) => {
        if (object.material) {
          const originalOpacity = object.material.opacity !== undefined ? object.material.opacity : 1;
          object.material.transparent = true;
          object.material.opacity = 0;

          tl.to(
            object.material,
            {
              opacity: originalOpacity,
              duration: duration * 0.8,
              ease: 'power2.out'
            },
            0
          );
        }
      });

      // 淡入灯光
      this.lights.forEach(({ light }) => {
        if (light.intensity !== undefined) {
          const originalIntensity = light.intensity;
          light.intensity = 0;

          tl.to(
            light,
            {
              intensity: originalIntensity,
              duration: duration * 0.6,
              ease: 'power2.out'
            },
            0.2
          );
        }
      });

      // 相机动画
      if (config.entrancePosition) {
        const startPos = { ...config.entrancePosition };
        startPos.z += 5; // 从更远处开始

        sceneManager.camera.position.set(startPos.x, startPos.y, startPos.z);

        tl.to(
          sceneManager.camera.position,
          {
            x: config.entrancePosition.x,
            y: config.entrancePosition.y,
            z: config.entrancePosition.z,
            duration: duration,
            ease: 'power2.inOut'
          },
          0
        );
      }
    });
  }

  /**
   * 设置展厅背景
   */
  setupBackground() {
    const { sceneManager } = this;
    if (sceneManager.scene) {
      sceneManager.scene.background = new THREE.Color(this.config.backgroundColor);
    }
  }

  /**
   * 创建展厅结构
   */
  async createHallStructure() {
    const { sceneManager } = this;

    // 创建地面
    await this.createFloor();

    // 创建墙面
    await this.createWalls();

    // 创建顶棚
    await this.createCeiling();
  }

  /**
   * 创建地面
   */
  async createFloor() {
    const { sceneManager, config } = this;
    const { scene } = sceneManager;

    // 地面几何体
    const floorGeometry = new THREE.PlaneGeometry(config.width, config.length);
    this.geometries.floor = floorGeometry;

    // 地面材质
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: config.floorColor,
      roughness: 0.8,
      metalness: 0.1
    });
    this.materials.floor = floorMaterial;

    // 地面网格
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;

    scene.add(floor);
    this.objects.push({ name: 'floor', object: floor });

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(config.width, config.width, 0x5c4033, 0x3d2817);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    this.objects.push({ name: 'gridHelper', object: gridHelper });
  }

  /**
   * 创建墙面
   */
  async createWalls() {
    const { sceneManager, config } = this;
    const { scene } = sceneManager;

    // 墙面高度
    const wallHeight = config.height;
    // 墙面厚度
    const wallThickness = 0.2;

    // 墙面材质
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: config.wallColor,
      roughness: 0.9,
      metalness: 0.0
    });
    this.materials.wall = wallMaterial;

    // 创建四面墙
    const walls = [
      {
        name: 'backWall',
        width: config.width,
        height: wallHeight,
        position: { x: 0, y: wallHeight / 2, z: -config.length / 2 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        name: 'frontWall',
        width: config.width,
        height: wallHeight,
        position: { x: 0, y: wallHeight / 2, z: config.length / 2 },
        rotation: { x: 0, y: Math.PI, z: 0 }
      },
      {
        name: 'leftWall',
        width: config.length,
        height: wallHeight,
        position: { x: -config.width / 2, y: wallHeight / 2, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 }
      },
      {
        name: 'rightWall',
        width: config.length,
        height: wallHeight,
        position: { x: config.width / 2, y: wallHeight / 2, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 }
      }
    ];

    walls.forEach((wall) => {
      const wallGeometry = new THREE.PlaneGeometry(wall.width, wall.height);
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

      wallMesh.position.set(wall.position.x, wall.position.y, wall.position.z);
      wallMesh.rotation.set(wall.rotation.x, wall.rotation.y, wall.rotation.z);

      // 禁用frustum culling，防止拖动视角时墙体闪烁
      wallMesh.frustumCulled = false;

      wallMesh.receiveShadow = true;

      scene.add(wallMesh);
      this.objects.push({ name: wall.name, object: wallMesh });
    });
  }

  /**
   * 创建顶棚
   */
  async createCeiling() {
    const { sceneManager, config } = this;
    const { scene } = sceneManager;

    // 顶棚几何体
    const ceilingGeometry = new THREE.PlaneGeometry(config.width, config.length);
    this.geometries.ceiling = ceilingGeometry;

    // 顶棚材质
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: config.ceilingColor,
      roughness: 0.7,
      metalness: 0.1
    });
    this.materials.ceiling = ceilingMaterial;

    // 顶棚网格
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = config.height;
    ceiling.receiveShadow = true;

    scene.add(ceiling);
    this.objects.push({ name: 'ceiling', object: ceiling });
  }

  /**
   * 创建展品（由子类实现）
   */
  async createArtworks() {
    // 由子类实现
    console.warn(`${this.config.name}.createArtworks() should be implemented by subclass`);
  }

  /**
   * 创建交互区域（由子类实现）
   */
  async createInteractionAreas() {
    // 由子类实现，用于创建可交互的区域
    console.warn(`${this.config.name}.createInteractionAreas() should be implemented by subclass`);
  }

  /**
   * 添加展品到场景
   */
  addArtwork(artwork) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建画框
    const frame = this.createFrame(artwork);
    scene.add(frame);
    this.objects.push({ name: `artwork_${artwork.id}`, object: frame });

    // 添加到布局
    this.layout.artworks.push(artwork);
  }

  /**
   * 创建画框
   */
  createFrame(artwork) {
    const { sceneManager } = this;

    // 从artwork.size或直接从artwork获取尺寸
    const width = artwork.size?.width || artwork.width || 2;
    const height = artwork.size?.height || artwork.height || 2;

    // 画框几何体
    const frameGeometry = new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.6,
      metalness: 0.3
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(artwork.position.x, artwork.position.y, artwork.position.z);
    frame.castShadow = true;
    frame.receiveShadow = true;

    // 添加用户数据
    frame.userData = {
      type: 'artwork',
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist || '黄宾虹',
      year: artwork.year || '',
      description: artwork.description || ''
    };

    return frame;
  }

  /**
   * 创建介绍面板
   */
  createInfoPanel(position, title = '', description = '', options = {}) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 处理参数 - 支持多种调用方式
    let panelConfig = {};
    let panelTitle = title;
    let panelDesc = description;

    // 如果第一个参数是对象（旧格式）
    if (position && typeof position === 'object' && !(position instanceof THREE.Vector3)) {
      panelConfig = position;
      panelTitle = title || panelConfig.title || '';
      panelDesc = description || panelConfig.description || '';
    } else {
      // 新格式：position 是 Vector3，后面跟着 title 和 description
      panelConfig = {
        position: position,
        title: title,
        description: description,
        ...options
      };
    }

    // 确保有位置
    const pos = panelConfig.position || new THREE.Vector3(0, 0, 0);

    // 创建Canvas用于绘制文本
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const canvasWidth = 512;
    const canvasHeight = 384;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 绘制面板背景
    ctx.fillStyle = this.rgbToHex(panelConfig.color || 0xf5f5dc);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制边框
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvasWidth - 8, canvasHeight - 8);

    // 绘制标题
    ctx.fillStyle = '#2a1f1a';
    ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 处理多行标题
    const titleLines = this.wrapText(ctx, panelTitle, canvasWidth - 40);
    const titleY = 40;
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvasWidth / 2, titleY + index * 36);
    });

    // 绘制描述
    ctx.fillStyle = '#4a3728';
    ctx.font = '20px "Microsoft YaHei", sans-serif';

    // 处理多行描述
    const descLines = this.wrapText(ctx, panelDesc, canvasWidth - 40);
    const descY = 150;
    descLines.forEach((line, index) => {
      ctx.fillText(line, canvasWidth / 2, descY + index * 30);
    });

    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // 创建面板材质
    const panelGeometry = new THREE.PlaneGeometry(panelConfig.width || 3, panelConfig.height || 2);
    const panelMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: false,
      roughness: 0.8,
      metalness: 0.1
    });

    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    panelMesh.position.set(pos.x, pos.y, pos.z);

    if (panelConfig.rotation) {
      panelMesh.rotation.set(panelConfig.rotation.x || 0, panelConfig.rotation.y || 0, panelConfig.rotation.z || 0);
    }

    scene.add(panelMesh);
    this.objects.push({ name: `panel_${Date.now()}`, object: panelMesh });

    // 设置交互数据
    panelMesh.userData = {
      type: 'info-panel',
      title: panelTitle,
      description: panelDesc,
      interactive: true
    };

    return panelMesh;
  }

  /**
   * 文本换行处理
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  /**
   * 颜色转换为十六进制
   */
  rgbToHex(color) {
    const hex = color.toString(16);
    return '#' + hex.slice(1).padStart(5, '0');
  }

  /**
   * 创建灯光
   */
  async createLights() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    this.lights.push({ name: 'ambient', light: ambientLight });

    // 主方向光
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);
    this.lights.push({ name: 'mainLight', light: mainLight });

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffd700, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);
    this.lights.push({ name: 'fillLight', light: fillLight });
  }

  /**
   * 更新场景
   */
  update(deltaTime) {
    // 由子类实现，用于动画或动态效果

    // 更新灯光动画
    this.lights.forEach(({ light }) => {
      if (light.userData.animation) {
        light.userData.animation.update(deltaTime);
      }
    });

    // 更新对象动画
    this.objects.forEach(({ object }) => {
      if (object.userData.animation) {
        object.userData.animation.update(deltaTime);
      }
    });
  }

  /**
   * 获取展品信息
   */
  getArtworkInfo(artworkId) {
    return this.layout.artworks.find((artwork) => artwork.id === artworkId);
  }

  /**
   * 获取区域信息
   */
  getAreaInfo(areaId) {
    return this.layout.areas.find((area) => area.id === areaId);
  }

  /**
   * 获取展厅中的对象
   */
  getObjectByName(name) {
    const found = this.objects.find((obj) => obj.name === name);
    return found ? found.object : null;
  }

  /**
   * 获取展厅中的所有可交互对象
   */
  getInteractableObjects() {
    return this.objects
      .filter(({ object }) => object.userData && object.userData.interactable)
      .map(({ object }) => object);
  }

  /**
   * 隐藏对象
   */
  hideObject(name) {
    const object = this.getObjectByName(name);
    if (object) {
      object.visible = false;
      this.state.visibleObjects.delete(name);
    }
  }

  /**
   * 显示对象
   */
  showObject(name) {
    const object = this.getObjectByName(name);
    if (object) {
      object.visible = true;
      this.state.visibleObjects.add(name);
    }
  }

  /**
   * 切换对象可见性
   */
  toggleObjectVisibility(name) {
    const object = this.getObjectByName(name);
    if (object) {
      object.visible = !object.visible;
      if (object.visible) {
        this.state.visibleObjects.add(name);
      } else {
        this.state.visibleObjects.delete(name);
      }
    }
  }

  /**
   * 销毁展厅
   */
  async destroy() {
    if (!this.isInitialized) {
      return;
    }

    console.log(`Destroying ${this.config.name}...`);

    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 停止所有动画
    this.state.isAnimating = false;
    gsap.killTweensOf(sceneManager.camera.position);
    gsap.killTweensOf(sceneManager.controls.target);

    // 移除所有对象
    this.objects.forEach(({ name, object }) => {
      scene.remove(object);

      // 停止对象的动画
      gsap.killTweensOf(object);
      if (object.material) {
        gsap.killTweensOf(object.material);
      }

      // 释放资源
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.objects = [];

    // 移除所有灯光
    this.lights.forEach(({ light }) => {
      gsap.killTweensOf(light);
      scene.remove(light);
    });
    this.lights = [];

    // 释放材质
    Object.values(this.materials).forEach((material) => {
      if (material) {
        gsap.killTweensOf(material);
        material.dispose();
      }
    });
    this.materials = {};

    // 释放几何体
    Object.values(this.geometries).forEach((geometry) => {
      if (geometry) {
        geometry.dispose();
      }
    });
    this.geometries = {};

    // 释放纹理
    Object.values(this.textures).forEach((texture) => {
      if (texture) {
        texture.dispose();
      }
    });
    this.textures = {};

    // 重置状态
    this.isInitialized = false;
    this.state.isLoaded = false;
    this.state.visibleObjects.clear();

    // 清空布局
    this.layout.areas = [];
    this.layout.artworks = [];
    this.layout.path = [];

    console.log(`${this.config.name} destroyed`);
  }
}
