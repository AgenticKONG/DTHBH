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
    // 序厅配置 - 按照设计文档：24m × 20m
    const introConfig = {
      name: 'intro',
      displayName: '序厅',
      description: '黄宾虹数字艺术展 - 入口大厅',
      width: 24,
      length: 20,
      height: 10,
      backgroundColor: 0x2a1f1a,
      wallColor: 0xf5f5f5,
      floorColor: 0x3d2817,
      ceilingColor: 0xffffff,
      enableIntroAnimation: true,
      introDuration: 2.0,
      cameraPosition: { x: -10, y: 2, z: 0 }, // 左侧入口进入
      cameraTarget: { x: 0, y: 2, z: 0 }, // 看向展厅中央
      ...config
    };

    super(sceneManager, introConfig);

    // 序厅配置 - 4道隔断墙形成S形路线 + 装饰柱
    this.introConfig = {
      walls: [
        // 第1道隔断墙 - 引导向上
        { x: -2, z: -3, width: 14, height: 8, depth: 0.2 },
        // 第2道隔断墙 - 引导向右
        { x: -8, z: 3, width: 0.2, height: 8, depth: 14 },
        // 第3道隔断墙 - 引导向上
        { x: 2, z: 8, width: 14, height: 8, depth: 0.2 },
        // 第4道隔断墙 - 引导向右（出口）
        { x: 8, z: 3, width: 0.2, height: 8, depth: 14 }
      ],
      // 装饰柱位置（3根）
      columns: [
        { x: -6, z: -6, radius: 0.3, height: 7 },
        { x: 0, z: -6, radius: 0.3, height: 7 },
        { x: 6, z: -6, radius: 0.3, height: 7 }
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

    // 创建隔断墙
    await this.createIntroWalls();
  }

  /**
   * 创建序厅隔断墙
   */
  async createIntroWalls() {
    const { sceneManager, introConfig } = this;
    const { scene } = sceneManager;

    // 隔断墙材质 - 米白色
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true
    });

    // 创建隔断墙
    introConfig.walls.forEach((wallConfig) => {
      const wallGeometry = new THREE.BoxGeometry(wallConfig.width, wallConfig.height, wallConfig.depth);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(wallConfig.x, wallConfig.height / 2, wallConfig.z);
      wall.receiveShadow = true;
      wall.castShadow = true;
      scene.add(wall);
      this.objects.push({ name: `introWall`, object: wall });
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
   * 创建展品（信息面板）- 按照设计文档的S形路线
   */
  async createArtworks() {
    // 区域1：黄宾虹简介 - 中央展示区
    this.createInfoPanel(
      new THREE.Vector3(0, 2.5, -3),
      '黄宾虹（1865-1955）',
      '中国近现代山水画大师\n与齐白石并称"北齐南黄"\n\n独创"五笔七墨"理论\n奠定中国画理论体系',
      { width: 5, height: 3, color: 0xfaf0e6 }
    );
    
    // 区域2：艺术成就 - 左侧
    this.createInfoPanel(
      new THREE.Vector3(-8, 2.5, 0),
      '艺术成就',
      '• 创作作品5000余幅\n• 书法理论著作《画学编》\n• 中国画理论体系奠基人\n• 获"人民艺术家"称号',
      { width: 4.5, height: 3, rotation: { y: Math.PI / 2 }, color: 0xfaf0e6 }
    );
    
    // 区域3：展览导览 - 右侧（互动屏）
    this.createInfoPanel(
      new THREE.Vector3(8, 2.5, 0),
      '展览导览',
      '• 早期：疏淡清逸（1865-1930）\n• 盛期：浑厚华滋（1930-1948）\n• 晚期：黑密厚重（1948-1955）\n• 尾厅：艺术成就',
      { width: 4.5, height: 3, rotation: { y: -Math.PI / 2 }, color: 0xfaf0e6 }
    );
    
    // 区域4：参观提示 - 后方
    this.createInfoPanel(
      new THREE.Vector3(2, 2.5, 8),
      '参观须知',
      '• 请保持安静\n• 禁止使用闪光灯\n• 请勿触摸展品\n• 建议游览时间：60分钟',
      { width: 3.5, height: 2.5, rotation: { y: Math.PI }, color: 0xfaf0e6 }
    );
    
    // 区域5：早期展厅入口 - 右侧出口处
    this.createEntranceMarker('early', '早期展厅', '疏淡清逸 - 白宾虹时期');
    
    // 创建装饰柱
    this.createColumns();
  }

  /**
   * 创建序厅介绍面板
   */
  async createInfoPanels() {
    // 隔断墙位置：z=-5（横向）, x=-10, x=10（纵向）
    // 主墙体位置：x=±12, z=±10
    
    // 黃宾虹简介面板 - 在隔断墙2上（z=-5，正对入口）
    this.createInfoPanel(
      new THREE.Vector3(0, 2.5, -4.8),
      '黃宾虹',
      '（1865-1955）中国近现代山水画大师',
      {
        width: 6,
        height: 3,
        rotation: { x: 0, y: 0, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 艺术成就面板 - 在隔断墙1上（x=-10，左侧纵向）
    this.createInfoPanel(
      new THREE.Vector3(-9.8, 2.5, 0),
      '艺术成就',
      '创作作品5000余幅\n书法理论著作《画学编》\n中国画理论体系奠基者',
      {
        width: 4,
        height: 2.5,
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 展览导览面板 - 在隔断墙3上（x=10，右侧纵向）
    this.createInfoPanel(
      new THREE.Vector3(9.8, 2.5, 0),
      '展览导览',
      '早期：疏淡清逸\n盛期：浑厚华滋\n晚期：黑密厚重\n尾厅：艺术成就',
      {
        width: 4,
        height: 2.5,
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        color: 0xfaf0e6
      }
    );

    // 参观提示面板 - 主前墙上（z=9.8）
    this.createInfoPanel(
      new THREE.Vector3(5, 2.5, 9.8),
      '参观提示',
      '请保持安静\n禁止使用闪光灯\n请勿触摸展品',
      {
        width: 3,
        height: 2,
        rotation: { x: 0, y: Math.PI, z: 0 },
        color: 0xfaf0e6
      }
    );
  }

  /**
   * 创建序厅灯光 - 按照设计文档的5个区域照明
   */
  async createLights() {
    const { sceneManager } = this;
    const lightManager = sceneManager.lightManager;

    if (!lightManager) {
      console.warn('LightManager not available');
      return;
    }

    // 环境光 - 整体照明
    lightManager.createLight('ambient', {
      preset: 'ambient',
      color: 0xfff8e7,
      intensity: 0.6
    });

    // 主光源（顶部）- 均匀覆盖整个序厅
    lightManager.createLight('mainLight', {
      preset: 'mainLight',
      position: { x: 0, y: 9, z: 0 },
      intensity: 0.8,
      castShadow: true
    });

    // 聚光灯1：照亮黃宾虹简介区（中央）
    lightManager.createLight('spotIntro', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.2,
      position: { x: 0, y: 8, z: -3 },
      target: { x: 0, y: 2, z: -3 },
      angle: Math.PI / 4,
      penumbra: 0.3
    });

    // 聚光灯2：照亮艺术成就区（左侧）
    lightManager.createLight('spotAchievement', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: -8, y: 8, z: 0 },
      target: { x: -8, y: 2, z: 0 },
      angle: Math.PI / 4,
      penumbra: 0.3
    });

    // 聚光灯3：照亮展览导览区（右侧）
    lightManager.createLight('spotGuide', {
      type: 'spot',
      color: 0xffffff,
      intensity: 1.0,
      position: { x: 8, y: 8, z: 0 },
      target: { x: 8, y: 2, z: 0 },
      angle: Math.PI / 4,
      penumbra: 0.3
    });

    // 聚光灯4：照亮参观提示区（后方）
    lightManager.createLight('spotTips', {
      type: 'spot',
      color: 0xffffff,
      intensity: 0.8,
      position: { x: 2, y: 8, z: 8 },
      target: { x: 2, y: 2, z: 8 },
      angle: Math.PI / 4,
      penumbra: 0.3
    });

    // 聚光灯5：照亮早期展厅入口（出口）
    lightManager.createLight('spotExit', {
      type: 'spot',
      color: 0xffd700,
      intensity: 1.0,
      position: { x: 10, y: 8, z: 8 },
      target: { x: 10, y: 2, z: 8 },
      angle: Math.PI / 4,
      penumbra: 0.3
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
