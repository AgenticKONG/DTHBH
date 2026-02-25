/**
 * 早期展厅场景
 *
 * 职责:
 * - 创建早期展厅的3D空间（16m×80m×12m）
 * - 实现三个区域的展品布局（宗法新安、花鸟探索、画风转变）
 * - 创建早期展厅介绍面板
 * - 实现入口和出口标记
 * - 配置早期展厅灯光
 * - 实现交互功能
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { HallScene } from './HallScene.js';

export class EarlyHall extends HallScene {
  constructor(sceneManager, config = {}) {
    // 早期展厅配置
    const earlyConfig = {
      name: 'early',
      displayName: '早期展厅',
      description: '疏淡清逸 - 宗法新安与花鸟探索',
      width: 16,
      length: 80,
      height: 12,
      backgroundColor: 0x2a1f1a,
      wallColor: 0xf5f5f5, // 米白色
      floorColor: 0x3d2817, // 深棕色
      ceilingColor: 0xffffff, // 白色
      enableIntroAnimation: true,
      introDuration: 2.0,
      cameraPosition: { x: 0, y: 2, z: 35 },
      cameraTarget: { x: 0, y: 1.5, z: 30 },
      ...config
    };

    super(sceneManager, earlyConfig);

    // 早期展厅特定配置
    this.earlyConfig = {
      // 区域配置
      areas: {
        xinan: {
          name: '宗法新安区',
          period: '1870-1890',
          description: '早期学习新安画派',
          zRange: [-38, -20]
        },
        flower: {
          name: '花鸟探索区',
          period: '1890-1910',
          description: '花鸟画实践',
          zRange: [-10, 10]
        },
        transition: {
          name: '画风转变区',
          period: '1910-1930',
          description: '由白入黄',
          zRange: [20, 38]
        }
      },
      // 隔断墙配置
      walls: [
        { x: -4, z: -15, width: 0.3, height: 12, depth: 10 },
        { x: 4, z: 15, width: 0.3, height: 12, depth: 10 }
      ],
      // 入口标记位置
      introEntrance: { x: -7, y: 0, z: -38 },
      // 出口标记位置（通往盛期展厅）
      middleEntrance: { x: 7, y: 0, z: 38 }
    };
  }

  /**
   * 加载早期展厅配置
   */
  async loadConfig() {
    // 早期展厅布局配置
    this.layout.areas = [
      {
        id: 'xinan',
        name: '宗法新安区',
        description: '1870-1890年，早期学习新安画派',
        position: { x: 0, y: 0, z: -30 }
      },
      {
        id: 'flower',
        name: '花鸟探索区',
        description: '1890-1910年，花鸟画实践',
        position: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'transition',
        name: '画风转变区',
        description: '1910-1930年，由白入黄',
        position: { x: 0, y: 0, z: 30 }
      }
    ];

    // 早期展厅展品配置
    this.layout.artworks = [
      // 宗法新安区（3幅）
      {
        id: 'early_1',
        title: '春山红树',
        year: '1880',
        area: 'xinan',
        position: { x: -7, y: 2.5, z: -32 },
        rotation: { x: 0, y: 0.5, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      {
        id: 'early_2',
        title: '青山古寺',
        year: '1885',
        area: 'xinan',
        position: { x: 0, y: 2.5, z: -34 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      {
        id: 'early_3',
        title: '秋江独钓',
        year: '1890',
        area: 'xinan',
        position: { x: 7, y: 2.5, z: -32 },
        rotation: { x: 0, y: -0.5, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      // 花鸟探索区（3幅）
      {
        id: 'early_4',
        title: '夏花',
        year: '1895',
        area: 'flower',
        position: { x: -7, y: 2.5, z: -2 },
        rotation: { x: 0, y: 0.5, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      {
        id: 'early_5',
        title: '寒梅',
        year: '1900',
        area: 'flower',
        position: { x: 0, y: 2.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      {
        id: 'early_6',
        title: '墨竹',
        year: '1905',
        area: 'flower',
        position: { x: 7, y: 2.5, z: -2 },
        rotation: { x: 0, y: -0.5, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      // 画风转变区（2幅）
      {
        id: 'early_7',
        title: '烟雨江南',
        year: '1915',
        area: 'transition',
        position: { x: -3, y: 2.5, z: 32 },
        rotation: { x: 0, y: 0.3, z: 0 },
        size: { width: 1.5, height: 2.0 }
      },
      {
        id: 'early_8',
        title: '暮云春树',
        year: '1920',
        area: 'transition',
        position: { x: 3, y: 2.5, z: 32 },
        rotation: { x: 0, y: -0.3, z: 0 },
        size: { width: 1.5, height: 2.0 }
      }
    ];
  }

  /**
   * 创建展厅结构
   */
  async createHallStructure() {
    await super.createHallStructure();

    // 创建早期展厅特定的建筑元素
    await this.createEarlyWalls();
  }

  /**
   * 创建早期展厅隔断墙
   */
  async createEarlyWalls() {
    const { sceneManager, earlyConfig } = this;
    const { scene } = sceneManager;

    // 墙面材质
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // 米白色
      roughness: 0.9,
      metalness: 0.1,
      depthTest: true, // 启用深度测试
      depthWrite: true // 启用深度写入
    });
    this.materials.earlyWall = wallMaterial;

    // 创建隔断墙
    earlyConfig.walls.forEach((wallConfig, index) => {
      const wallGeometry = new THREE.BoxGeometry(wallConfig.width, wallConfig.height, wallConfig.depth);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(wallConfig.x, wallConfig.height / 2, wallConfig.z);

      // 禁用frustum culling，防止拖动视角时墙体闪烁
      wall.frustumCulled = false;

      // 启用深度测试和深度写入
      wall.material.depthTest = true;
      wall.material.depthWrite = true;

      // 设置渲染顺序，确保墙体正确渲染
      wall.renderOrder = 0;

      wall.receiveShadow = true;
      wall.castShadow = true;

      scene.add(wall);
      this.objects.push({ name: `earlyWall_${index}`, object: wall });
    });
  }

  /**
   * 创建展品
   */
  async createArtworks() {
    // 创建所有展品
    this.layout.artworks.forEach((artwork) => {
      this.addArtwork({
        id: artwork.id,
        title: artwork.title,
        year: artwork.year,
        area: artwork.area,
        position: artwork.position,
        rotation: artwork.rotation,
        size: artwork.size,
        description: `黄宾虹早期作品，创作于${artwork.year}`
      });
    });
  }

  /**
   * 创建早期展厅介绍面板
   */
  async createInfoPanels() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 宗法新安介绍面板
    const xinanPanel = this.createInfoPanel({
      id: 'xinanPanel',
      width: 3,
      height: 1.5,
      position: { x: -7, y: 1.5, z: -37 },
      rotation: { x: 0, y: 0.5, z: 0 },
      color: 0xfaf0e6
    });

    // 花鸟探索介绍面板
    const flowerPanel = this.createInfoPanel({
      id: 'flowerPanel',
      width: 3,
      height: 1.5,
      position: { x: -7, y: 1.5, z: -5 },
      rotation: { x: 0, y: 0.5, z: 0 },
      color: 0xfaf0e6
    });

    // 画风转变介绍面板
    const transitionPanel = this.createInfoPanel({
      id: 'transitionPanel',
      width: 3,
      height: 1.5,
      position: { x: 7, y: 1.5, z: 37 },
      rotation: { x: 0, y: -0.5, z: 0 },
      color: 0xfaf0e6
    });

    // 互动展示区（五笔七墨）
    this.createInteractiveDisplay();
  }

  /**
   * 创建互动展示区
   */
  async createInteractiveDisplay() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 互动展示台
    const displayGeometry = new THREE.BoxGeometry(2, 1, 1);
    const displayMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.7,
      metalness: 0.2
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.5, 5);
    display.receiveShadow = true;
    display.castShadow = true;

    scene.add(display);
    this.objects.push({ name: 'interactiveDisplay', object: display });

    // 设置用户数据
    display.userData = {
      type: 'interactive',
      content: '五笔七墨',
      description: '黄宾虹独创的笔墨技法',
      interactable: true
    };
  }

  /**
   * 创建早期展厅灯光
   */
  async createLights() {
    const { sceneManager } = this;
    const lightManager = sceneManager.lightManager;

    if (!lightManager) {
      console.warn('LightManager not available');
      return;
    }

    // 环境光（清新淡雅）
    lightManager.createLight('ambient', {
      type: 'ambient',
      color: 0xffffff,
      intensity: 0.5
    });

    // 主光源（顶部）
    lightManager.createLight('mainLight', {
      type: 'directional',
      color: 0xffffff,
      intensity: 0.7,
      position: { x: 0, y: 10, z: 0 },
      castShadow: true
    });

    // 宗法新安区聚光灯
    lightManager.createLight('xinanSpotlight', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 0, y: 8, z: -30 },
      target: { x: 0, y: 2, z: -30 },
      angle: Math.PI / 4,
      penumbra: 0.5
    });

    // 花鸟探索区聚光灯
    lightManager.createLight('flowerSpotlight', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 0, y: 8, z: 0 },
      target: { x: 0, y: 2, z: 0 },
      angle: Math.PI / 4,
      penumbra: 0.5
    });

    // 画风转变区聚光灯
    lightManager.createLight('transitionSpotlight', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 0, y: 8, z: 30 },
      target: { x: 0, y: 2, z: 30 },
      angle: Math.PI / 4,
      penumbra: 0.5
    });

    // 作品聚光灯（为每幅作品添加聚光灯）
    this.layout.artworks.forEach((artwork, index) => {
      lightManager.createLight(`artworkSpotlight_${index}`, {
        type: 'spot',
        color: 0xffd700,
        intensity: 0.8,
        position: {
          x: artwork.position.x,
          y: 6,
          z: artwork.position.z + 2
        },
        target: artwork.position,
        angle: Math.PI / 6,
        penumbra: 0.3,
        castShadow: false
      });
    });
  }

  /**
   * 创建交互区域
   */
  async createInteractionAreas() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 序厅入口标记
    this.createEntranceMarker('intro', '序厅', '返回入口');

    // 盛期展厅入口标记
    this.createEntranceMarker('middle', '盛期展厅', '浑厚华滋');
  }

  /**
   * 创建入口标记
   */
  createEntranceMarker(hallId, hallName, description) {
    const { sceneManager, earlyConfig } = this;
    const { scene } = sceneManager;

    const position = hallId === 'intro' ? earlyConfig.introEntrance : earlyConfig.middleEntrance;

    // 入口标记柱
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // 金色
      roughness: 0.3,
      metalness: 0.8
    });
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(position.x, 2, position.z);
    pillar.receiveShadow = true;
    pillar.castShadow = true;

    scene.add(pillar);
    this.objects.push({ name: `${hallId}EntrancePillar`, object: pillar });

    // 入口标记面板
    const panelGeometry = new THREE.PlaneGeometry(2, 1);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // 金色
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.DoubleSide
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(position.x, 3.5, position.z);
    panel.rotation.y = hallId === 'intro' ? 0 : Math.PI;

    scene.add(panel);
    this.objects.push({ name: `${hallId}EntrancePanel`, object: panel });

    // 设置用户数据用于交互
    panel.userData = {
      type: 'entrance',
      hallId: hallId,
      hallName: hallName,
      description: description,
      interactable: true
    };
  }

  /**
   * 获取展厅入口标记
   */
  getEntranceMarkers() {
    const markers = [];

    this.objects.forEach(({ object }) => {
      if (object.userData && object.userData.type === 'entrance') {
        markers.push(object);
      }
    });

    return markers;
  }

  /**
   * 获取指定区域的作品
   */
  getArtworksByArea(area) {
    return this.layout.artworks.filter((artwork) => artwork.area === area);
  }
}
