/**
 * 序厅场景
 *
 * 职责:
 * - 创建序厅的3D空间（24m×20m×10m）
 * - 实现序厅建筑元素（隔断墙、装饰柱、展示板等）
 * - 创建序厅介绍面板
 * - 实现早期展厅入口标记
 * - 配置序厅灯光
 * - 实现交互功能
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { HallScene } from './HallScene.js';

export class IntroHall extends HallScene {
  constructor(sceneManager, config = {}) {
    // 序厅配置（S形布局，参考详细设计文档）
    const introConfig = {
      name: 'intro',
      displayName: '序厅',
      description: '黄宾虹数字艺术展 - 入口大厅',
      width: 24,
      length: 20,
      height: 10,
      backgroundColor: 0x2a1f1a,
      wallColor: 0xf5f5f5, // 米白色
      floorColor: 0x3d2817, // 深棕色
      ceilingColor: 0xffffff, // 白色
      enableIntroAnimation: true,
      introDuration: 2.0,
      cameraPosition: { x: 0, y: 2, z: 10 }, // 左侧入口位置
      cameraTarget: { x: 6.3, y: 1.5, z: 10 }, // 看向黄宾虹简介区域
      ...config
    };

    super(sceneManager, introConfig);

    // 序厅特定配置（简化版本，只保留3个隔断墙）
    this.introConfig = {
      // 隔断墙配置（3道，分散在不同位置）
      walls: [
        // 隔断墙1：左侧（纵向）
        { x: -7, z: 0, width: 0.3, height: 8, depth: 12 },
        // 隔断墙2：中间偏后（横向）
        { x: 0, z: -5, width: 12, height: 8, depth: 0.3 },
        // 隔断墙3：右侧（纵向）
        { x: 7, z: 0, width: 0.3, height: 8, depth: 12 }
      ]
    };
  }

  /**
   * 加载序厅配置
   */
  async loadConfig() {
    // 序厅布局配置
    this.layout.areas = [
      {
        id: 'intro',
        name: '黄宾虹简介区',
        description: '中央展示区，介绍黄宾虹的生平',
        position: { x: 0, y: 0, z: 2 }
      },
      {
        id: 'achievements',
        name: '艺术成就区',
        description: '展示黄宾虹的重要作品和荣誉',
        position: { x: -6, y: 0, z: -4 }
      },
      {
        id: 'guide',
        name: '展览导览区',
        description: '互动屏提供展览导览',
        position: { x: 0, y: 0, z: -6 }
      },
      {
        id: 'tips',
        name: '参观提示区',
        description: '参观须知和操作指南',
        position: { x: 6, y: 0, z: -4 }
      }
    ];
  }

  /**
   * 创建展厅结构
   */
  async createHallStructure() {
    await super.createHallStructure();

    // 创建序厅特定的建筑元素（只保留隔断墙）
    await this.createIntroWalls();
  }

  /**
   * 创建序厅隔断墙
   */
  async createIntroWalls() {
    const { sceneManager, introConfig } = this;
    const { scene } = sceneManager;

    // 墙面材质（简化设置）
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5, // 米白色
      roughness: 0.9,
      metalness: 0.1
    });
    this.materials.introWall = wallMaterial;

    // 创建隔断墙
    console.log('Creating intro walls, count:', introConfig.walls.length);
    introConfig.walls.forEach((wallConfig, index) => {
      console.log(`Creating wall ${index}:`, wallConfig);
      const wallGeometry = new THREE.BoxGeometry(wallConfig.width, wallConfig.height, wallConfig.depth);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(wallConfig.x, wallConfig.height / 2, wallConfig.z);

      wall.receiveShadow = true;
      wall.castShadow = true;

      scene.add(wall);
      this.objects.push({ name: `introWall_${index}`, object: wall });
    });
  }

  /**
   * 创建装饰柱
   */
  async createColumns() {
    const { sceneManager, introConfig } = this;
    const { scene } = sceneManager;

    // 如果没有装饰柱配置，直接返回
    if (!introConfig.columns || introConfig.columns.length === 0) {
      return;
    }

    // 柱子材质
    const columnMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c4a8, // 浅米色
      roughness: 0.6,
      metalness: 0.2
    });
    this.materials.column = columnMaterial;

    // 柱头材质（金色）
    const capitalMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // 金色
      roughness: 0.3,
      metalness: 0.8
    });
    this.materials.columnCapital = capitalMaterial;

    // 创建装饰柱（高度8m，与隔断墙匹配）
    introConfig.columns.forEach((columnConfig, index) => {
      // 柱身
      const columnGeometry = new THREE.CylinderGeometry(
        columnConfig.radius,
        columnConfig.radius,
        columnConfig.height, // 8m高度
        16
      );
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.set(columnConfig.x, columnConfig.height / 2, columnConfig.z);
      column.receiveShadow = true;
      column.castShadow = true;

      scene.add(column);
      this.objects.push({ name: `column_${index}`, object: column });

      // 柱头
      const capitalGeometry = new THREE.BoxGeometry(columnConfig.radius * 3, 0.2, columnConfig.radius * 3);
      const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
      capital.position.set(columnConfig.x, columnConfig.height, columnConfig.z);
      capital.receiveShadow = true;
      capital.castShadow = true;

      scene.add(capital);
      this.objects.push({ name: `columnCapital_${index}`, object: capital });
    });
  }

  /**
   * 创建入口地毯
   */
  async createEntranceCarpet() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 地毯材质
    const carpetMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b0000, // 深红色
      roughness: 0.9,
      metalness: 0.0
    });
    this.materials.carpet = carpetMaterial;

    // 圆形地毯
    const carpetGeometry = new THREE.CircleGeometry(3, 32);
    const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.01, 6); // 入口处
    carpet.receiveShadow = true;

    scene.add(carpet);
    this.objects.push({ name: 'carpet', object: carpet });
  }

  /**
   * 创建地面浏览路线图（金色虚线）
   */
  async createBrowsingRoute() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 浏览路线点（确保完全从隔断墙空隙穿过）
    // 隔断墙1：x=10.07, z范围0-8.57
    // 隔断墙2：x=10.07, z范围10-20
    // 隔断墙3：x=14.52, z范围0-8.57
    // 隔断墙4：x=18.97, z范围10-20
    // 空隙位置：z=8.57到z=10（1.43米宽）
    const routePoints = [
      new THREE.Vector3(0, 0.01, 10), // 主入口
      new THREE.Vector3(2.52, 0.01, 10), // 进入展厅
      new THREE.Vector3(4.42, 0.01, 5), // 黄宾虹简介区
      new THREE.Vector3(7, 0.01, 5), // 中间过渡点
      new THREE.Vector3(8.84, 0.01, 4.29), // 艺术成就区
      new THREE.Vector3(9.5, 0.01, 6), // 点1：接近隔断墙
      new THREE.Vector3(10.07, 0.01, 9.28), // 点2：穿过隔断墙1和2之间的空隙（z=9.28在8.57-10之间）
      new THREE.Vector3(11, 0.01, 12), // 点3：通过空隙后
      new THREE.Vector3(12.84, 0.01, 15), // 展览导览区
      new THREE.Vector3(13.5, 0.01, 12), // 点4：接近隔断墙3
      new THREE.Vector3(14.52, 0.01, 9.28), // 点5：穿过隔断墙3和4之间的空隙（z=9.28在8.57-10之间）
      new THREE.Vector3(15.5, 0.01, 7), // 点6：通过空隙后
      new THREE.Vector3(17.05, 0.01, 8.57), // 参观提示区
      new THREE.Vector3(19, 0.01, 6), // 中间过渡点
      new THREE.Vector3(21.47, 0.01, 4.29), // 早期展厅入口
      new THREE.Vector3(23.63, 0.01, 10) // 出口
    ];

    // 使用虚线材质绘制路线（金色，贴合地面）
    const lineMaterial = new THREE.LineDashedMaterial({
      color: 0xffd700, // 金色
      linewidth: 2, // 减小线宽
      scale: 1,
      dashSize: 0.6, // 虚线段长度
      gapSize: 0.3, // 虚线间隙
      opacity: 0.8, // 轻微透明
      transparent: true // 启用透明
    });
    this.materials.routeLine = lineMaterial;

    // 创建曲线
    const curve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.3);
    const points = curve.getPoints(200);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, lineMaterial);
    line.computeLineDistances(); // 计算虚线间距
    line.receiveShadow = false; // 不接收阴影，避免遮挡
    line.castShadow = false; // 不投射阴影
    line.renderOrder = 1; // 渲染顺序：1（在地面之后）

    scene.add(line);
    this.objects.push({ name: 'browsingRoute', object: line });

    // 添加箭头指示方向（只添加在关键转折点）
    const arrowIndices = [1, 5, 7, 10, 12, 14, 16]; // 关键转折点的索引
    for (const index of arrowIndices) {
      if (index > 0 && index < routePoints.length) {
        const arrow = this.createDirectionArrow(routePoints[index - 1], routePoints[index]);
        scene.add(arrow);
        this.objects.push({ name: `routeArrow_${index}`, object: arrow });
      }
    }
  }

  /**
   * 创建方向箭头
   */
  createDirectionArrow(fromPoint, toPoint) {
    // 计算方向
    const direction = new THREE.Vector3().subVectors(toPoint, fromPoint).normalize();

    // 计算中点
    const midPoint = new THREE.Vector3().addVectors(fromPoint, toPoint).multiplyScalar(0.5);

    // 创建箭头几何体
    const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700, // 金色
      roughness: 0.3,
      metalness: 0.8
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

    // 设置位置
    arrow.position.copy(midPoint);
    arrow.position.y = 0.02; // 地面上方

    // 计算旋转角度
    const target = new THREE.Vector3().addVectors(midPoint, direction);
    arrow.lookAt(target);
    arrow.rotateX(Math.PI / 2); // 调整为水平方向

    arrow.castShadow = true;

    return arrow;
  }

  /**
   * 创建展品（序厅没有传统画作，只有介绍面板）
   */
  async createArtworks() {
    // 序厅没有画作，只有介绍面板和导览信息
    console.log('Intro hall has no traditional artworks, only panels');
  }

  /**
   * 创建序厅介绍面板
   */
  async createInfoPanels() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 黄宾虹简介面板（区域1 - 中央展示区，SVG中心：80,130）
    const introPanel = this.createInfoPanel(
      new THREE.Vector3(4.42, 1.5, 8.57),
      '黄宾虹',
      '（1865-1955）\n中国近现代山水画大师\n\n"黑宾虹"开创\n五笔七墨理论\n\n山水画一代宗师',
      {
        width: 4,
        height: 2.5,
        rotation: { x: 0, y: 0, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 艺术成就面板（区域2 - 隔断墙1后左侧，SVG中心：150,70）
    const achievementsPanel = this.createInfoPanel(
      new THREE.Vector3(8.84, 1.5, 4.29),
      '艺术成就',
      '创作作品5000余幅\n\n书法理论著作\n《画学编》\n\n中国画理论体系\n奠基者',
      {
        width: 3,
        height: 2,
        rotation: { x: 0, y: 0.5, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 展览导览面板（区域3 - 隔断墙2后右侧，SVG中心：215,220）
    const guidePanel = this.createInfoPanel(
      new THREE.Vector3(12.84, 1.5, 15),
      '展览导览',
      '序厅：展览入口\n\n早期展厅：疏淡清逸\n\n盛期展厅：浑厚华滋\n\n晚期展厅：黑密厚重\n\n尾厅：艺术成就',
      {
        width: 3,
        height: 2,
        rotation: { x: 0, y: -0.5, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 参观提示面板（区域4 - 隔断墙3后左侧，SVG中心：280,130）
    const tipsPanel = this.createInfoPanel(
      new THREE.Vector3(17.05, 1.5, 8.57),
      '参观提示',
      '请保持安静\n\n禁止使用闪光灯\n\n请勿触摸展品\n\n建议游览时间：60分钟',
      {
        width: 3,
        height: 2,
        rotation: { x: 0, y: 0.5, z: 0 },
        color: 0xfaf0e6
      }
    );
  }

  /**
   * 创建序厅灯光
   */
  async createLights() {
    const { sceneManager } = this;
    const lightManager = sceneManager.lightManager;

    if (!lightManager) {
      console.warn('LightManager not available');
      return;
    }

    // 环境光
    lightManager.createLight('ambient', {
      preset: 'ambient',
      color: 0xffffff,
      intensity: 0.5
    });

    // 主光源（顶部）
    lightManager.createLight('mainLight', {
      preset: 'mainLight',
      position: { x: 0, y: 9, z: 0 },
      castShadow: true
    });

    // 补光（左侧）
    lightManager.createLight('fillLightLeft', {
      type: 'directional',
      color: 0xffd700,
      intensity: 0.3,
      position: { x: -8, y: 6, z: 0 }
    });

    // 补光（右侧）
    lightManager.createLight('fillLightRight', {
      type: 'directional',
      color: 0xffd700,
      intensity: 0.3,
      position: { x: 8, y: 6, z: 0 }
    });

    // 聚光灯照亮入口
    lightManager.createLight('entranceSpotlight', {
      type: 'spot',
      color: 0xffd700,
      intensity: 1.5,
      position: { x: 0, y: 8, z: 6 },
      target: { x: 0, y: 0, z: 6 },
      angle: Math.PI / 4,
      penumbra: 0.5
    });
  }

  /**
   * 创建交互区域
   */
  async createInteractionAreas() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 早期展厅入口标记
    this.createEntranceMarker('early', '早期展厅', '疏淡清逸');
  }

  /**
   * 创建入口标记
   */
  createEntranceMarker(hallId, hallName, description) {
    const { sceneManager, introConfig } = this;
    const { scene } = sceneManager;

    // 如果没有早期展厅入口配置，直接返回
    if (!introConfig.earlyHallEntrance) {
      return;
    }

    const position = introConfig.earlyHallEntrance;

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
    panel.rotation.y = Math.PI; // 面向入口方向

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
}
