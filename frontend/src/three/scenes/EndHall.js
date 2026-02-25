/**
 * 尾厅 - 艺术成就总结与传承
 *
 * 展厅特点：
 * - 48m×40m×10m（更大的空间）
 * - 横向布局：中央纪念区、左侧展区、右侧展区
 * - 无展品，主要展示成就和影响
 * - 庄重典雅色调
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { HallScene } from './HallScene.js';

export class EndHall extends HallScene {
  constructor(sceneManager, config = {}) {
    super(sceneManager, {
      name: 'end',
      displayName: '尾厅',
      description: '艺术成就总结与传承',
      width: 48,
      length: 40,
      height: 10,
      backgroundColor: 0x1a0f0a, // 深红黑色背景
      wallColor: 0x5c3030, // 深红色墙面
      floorColor: 0x2a1f1a, // 深色地面
      ceilingColor: 0x3d2020, // 深红色顶棚
      ...config
    });
  }

  /**
   * 创建展品
   */
  async createArtworks() {
    // 尾厅无展品，主要是展示空间
    console.log('EndHall: No artworks, creating achievement displays');
  }

  /**
   * 创建展厅结构（重写以适应横向布局）
   */
  async createHallStructure() {
    await super.createHallStructure();

    // 创建中央纪念区
    await this.createCentralMemorialArea();

    // 创建左侧展区（年表时间轴）
    await this.createLeftExhibitionArea();

    // 创建右侧展区（影响传承）
    await this.createRightExhibitionArea();

    // 创建感谢参观区域
    await this.createThankYouArea();
  }

  /**
   * 创建中央纪念区
   */
  async createCentralMemorialArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建中央平台
    const platformGeometry = new THREE.CylinderGeometry(8, 9, 0.5, 64);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.6,
      metalness: 0.4
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, 0.25, 0);
    platform.receiveShadow = true;
    scene.add(platform);
    this.objects.push({ name: 'central-platform', object: platform });

    // 创建金色边框
    const ringGeometry = new THREE.TorusGeometry(8.5, 0.3, 16, 64);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0, 0.5, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    this.objects.push({ name: 'central-ring', object: ring });

    // 创建中央纪念碑
    const monumentGeometry = new THREE.BoxGeometry(3, 5, 3);
    const monumentMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const monument = new THREE.Mesh(monumentGeometry, monumentMaterial);
    monument.position.set(0, 2.5, 0);
    monument.castShadow = true;
    monument.receiveShadow = true;
    scene.add(monument);
    this.objects.push({ name: 'central-monument', object: monument });

    // 金色顶部
    const topGeometry = new THREE.ConeGeometry(2, 1, 4);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(0, 6, 0);
    top.rotation.y = Math.PI / 4;
    top.castShadow = true;
    scene.add(top);
    this.objects.push({ name: 'central-top', object: top });

    // 艺术成就面板
    this.createAchievementPanel(new THREE.Vector3(-5, 4, -3), '艺术成就', '黄宾虹一生创作\n超过5000幅作品');

    // 荣誉展示
    this.createHonorDisplay(new THREE.Vector3(5, 4, -3));

    // 代表作展示
    this.createMasterpieceDisplay(new THREE.Vector3(5, 4, 3));

    // 年份标识
    this.createYearDisplay(new THREE.Vector3(-5, 4, 3), '1865-1955', '艺术生涯90年');

    // 记录区域信息
    this.layout.areas.push({
      id: 'central-memorial',
      name: '中央纪念区',
      year: '1865-1955',
      description: '艺术成就总结',
      position: new THREE.Vector3(0, 0, 0)
    });
  }

  /**
   * 创建艺术成就面板
   */
  createAchievementPanel(position, title, content) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    const panelGeometry = new THREE.PlaneGeometry(4, 3);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.copy(position);
    panel.rotation.y = Math.PI / 4;
    scene.add(panel);
    this.objects.push({ name: 'achievement-panel', object: panel });

    // 金色边框
    const frameGeometry = new THREE.BoxGeometry(4.2, 3.2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.copy(position);
    frame.position.z -= 0.1;
    frame.rotation.y = Math.PI / 4;
    scene.add(frame);
    this.objects.push({ name: 'achievement-frame', object: frame });

    // 设置交互数据
    panel.userData = {
      type: 'achievement',
      name: title,
      description: content,
      interactive: true
    };
  }

  /**
   * 创建荣誉展示
   */
  createHonorDisplay(position) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 荣誉奖章底座
    const pedestalGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.6,
      metalness: 0.4
    });

    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.copy(position);
    pedestal.position.y = 0.75;
    pedestal.castShadow = true;
    scene.add(pedestal);
    this.objects.push({ name: 'honor-pedestal', object: pedestal });

    // 荣誉奖章
    const medalGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    const medalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.9
    });

    const medal = new THREE.Mesh(medalGeometry, medalMaterial);
    medal.position.copy(position);
    medal.position.y = 2;
    medal.castShadow = true;
    scene.add(medal);
    this.objects.push({ name: 'honor-medal', object: medal });

    // 设置交互数据
    medal.userData = {
      type: 'honor',
      name: '荣誉奖章',
      description: '黄宾虹的艺术荣誉',
      interactive: true
    };
  }

  /**
   * 创建代表作展示
   */
  createMasterpieceDisplay(position) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 代表作画框
    const frameGeometry = new THREE.BoxGeometry(2.5, 2, 0.2);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.copy(position);
    frame.position.y = 2;
    frame.rotation.y = -Math.PI / 4;
    frame.castShadow = true;
    scene.add(frame);
    this.objects.push({ name: 'masterpiece-frame', object: frame });

    // 画布
    const canvasGeometry = new THREE.PlaneGeometry(2.2, 1.7);
    const canvasMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9,
      metalness: 0.0
    });

    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
    canvas.position.copy(position);
    canvas.position.y = 2;
    canvas.position.z += 0.15;
    canvas.rotation.y = -Math.PI / 4;
    scene.add(canvas);
    this.objects.push({ name: 'masterpiece-canvas', object: canvas });

    // 设置交互数据
    canvas.userData = {
      type: 'masterpiece',
      name: '代表作',
      description: '黄宾虹的代表作精选',
      interactive: true
    };
  }

  /**
   * 创建年份显示
   */
  createYearDisplay(position, year, subtitle) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    const panelGeometry = new THREE.PlaneGeometry(4, 2);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.copy(position);
    panel.rotation.y = -Math.PI / 4;
    scene.add(panel);
    this.objects.push({ name: 'year-panel', object: panel });

    // 金色边框
    const frameGeometry = new THREE.BoxGeometry(4.2, 2.2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.copy(position);
    frame.position.z -= 0.1;
    frame.rotation.y = -Math.PI / 4;
    scene.add(frame);
    this.objects.push({ name: 'year-frame', object: frame });

    // 设置交互数据
    panel.userData = {
      type: 'year',
      name: year,
      description: subtitle,
      interactive: true
    };
  }

  /**
   * 创建左侧展区（年表时间轴）
   */
  async createLeftExhibitionArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建时间轴面板
    const timelineGeometry = new THREE.PlaneGeometry(3, 8);
    const timelineMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const timeline = new THREE.Mesh(timelineGeometry, timelineMaterial);
    timeline.position.set(-20, 4, 0);
    timeline.rotation.y = Math.PI / 2;
    scene.add(timeline);
    this.objects.push({ name: 'timeline-panel', object: timeline });

    // 时间轴边框
    const timelineFrameGeometry = new THREE.BoxGeometry(3.2, 8.2, 0.1);
    const timelineFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const timelineFrame = new THREE.Mesh(timelineFrameGeometry, timelineFrameMaterial);
    timelineFrame.position.set(-20, 4, 0);
    timelineFrame.rotation.y = Math.PI / 2;
    scene.add(timelineFrame);
    this.objects.push({ name: 'timeline-frame', object: timelineFrame });

    // 设置交互数据
    timeline.userData = {
      type: 'timeline',
      name: '年表时间轴',
      description: '1865-1955\n黄宾虹艺术生涯',
      interactive: true
    };

    // 记录区域信息
    this.layout.areas.push({
      id: 'left-exhibition',
      name: '左侧展区',
      year: '1865-1955',
      description: '年表时间轴',
      position: new THREE.Vector3(-20, 0, 0)
    });
  }

  /**
   * 创建右侧展区（影响传承）
   */
  async createRightExhibitionArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建影响传承面板
    const influenceGeometry = new THREE.PlaneGeometry(3, 8);
    const influenceMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const influence = new THREE.Mesh(influenceGeometry, influenceMaterial);
    influence.position.set(20, 4, 0);
    influence.rotation.y = -Math.PI / 2;
    scene.add(influence);
    this.objects.push({ name: 'influence-panel', object: influence });

    // 影响传承边框
    const influenceFrameGeometry = new THREE.BoxGeometry(3.2, 8.2, 0.1);
    const influenceFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const influenceFrame = new THREE.Mesh(influenceFrameGeometry, influenceFrameMaterial);
    influenceFrame.position.set(20, 4, 0);
    influenceFrame.rotation.y = -Math.PI / 2;
    scene.add(influenceFrame);
    this.objects.push({ name: 'influence-frame', object: influenceFrame });

    // 设置交互数据
    influence.userData = {
      type: 'influence',
      name: '影响传承',
      description: '对后世的影响\n教育和学术贡献',
      interactive: true
    };

    // 记录区域信息
    this.layout.areas.push({
      id: 'right-exhibition',
      name: '右侧展区',
      year: '现代',
      description: '影响传承',
      position: new THREE.Vector3(20, 0, 0)
    });
  }

  /**
   * 创建感谢参观区域
   */
  async createThankYouArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 感谢参观面板
    const thankYouGeometry = new THREE.PlaneGeometry(8, 2);
    const thankYouMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3030,
      roughness: 0.7,
      metalness: 0.3
    });

    const thankYou = new THREE.Mesh(thankYouGeometry, thankYouMaterial);
    thankYou.position.set(0, 3, 15);
    scene.add(thankYou);
    this.objects.push({ name: 'thank-you-panel', object: thankYou });

    // 金色边框
    const thankYouFrameGeometry = new THREE.BoxGeometry(8.2, 2.2, 0.1);
    const thankYouFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.8
    });

    const thankYouFrame = new THREE.Mesh(thankYouFrameGeometry, thankYouFrameMaterial);
    thankYouFrame.position.set(0, 3, 14.9);
    scene.add(thankYouFrame);
    this.objects.push({ name: 'thank-you-frame', object: thankYouFrame });

    // 设置交互数据
    thankYou.userData = {
      type: 'thank-you',
      name: '感谢参观',
      description: '感谢您的参观',
      interactive: true
    };
  }

  /**
   * 创建灯光
   */
  async createLights() {
    await super.createLights();

    // 调整环境光为庄重的深红色调
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 移除默认环境光
    const ambient = this.lights.find((l) => l.name === 'ambient');
    if (ambient) {
      scene.remove(ambient.light);
      this.lights = this.lights.filter((l) => l.name !== 'ambient');
    }

    // 创建深红色环境光
    const newAmbient = new THREE.AmbientLight(0x5c3030, 0.4);
    scene.add(newAmbient);
    this.lights.push({ name: 'ambient', light: newAmbient });

    // 为中央纪念碑添加聚光灯
    this.addCentralSpotlight();

    // 为左右展区添加聚光灯
    this.addSideSpotlights();

    // 为感谢参观区域添加聚光灯
    this.addThankYouSpotlight();
  }

  /**
   * 为中央纪念碑添加聚光灯
   */
  addCentralSpotlight() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    const spotlight = new THREE.SpotLight(0xffd700, 2, 20, Math.PI / 6, 0.3, 2);
    spotlight.position.set(0, 10, 0);
    spotlight.target.position.set(0, 3, 0);

    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    spotlight.shadow.bias = -0.0001;

    scene.add(spotlight);
    scene.add(spotlight.target);
    this.lights.push({ name: 'central-spotlight', light: spotlight });
  }

  /**
   * 为左右展区添加聚光灯
   */
  addSideSpotlights() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 左侧展区聚光灯
    const leftSpotlight = new THREE.SpotLight(0xffd700, 1.5, 15, Math.PI / 6, 0.3, 2);
    leftSpotlight.position.set(-15, 8, 0);
    leftSpotlight.target.position.set(-20, 4, 0);

    leftSpotlight.castShadow = true;
    leftSpotlight.shadow.mapSize.width = 1024;
    leftSpotlight.shadow.mapSize.height = 1024;

    scene.add(leftSpotlight);
    scene.add(leftSpotlight.target);
    this.lights.push({ name: 'left-spotlight', light: leftSpotlight });

    // 右侧展区聚光灯
    const rightSpotlight = new THREE.SpotLight(0xffd700, 1.5, 15, Math.PI / 6, 0.3, 2);
    rightSpotlight.position.set(15, 8, 0);
    rightSpotlight.target.position.set(20, 4, 0);

    rightSpotlight.castShadow = true;
    rightSpotlight.shadow.mapSize.width = 1024;
    rightSpotlight.shadow.mapSize.height = 1024;

    scene.add(rightSpotlight);
    scene.add(rightSpotlight.target);
    this.lights.push({ name: 'right-spotlight', light: rightSpotlight });
  }

  /**
   * 为感谢参观区域添加聚光灯
   */
  addThankYouSpotlight() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    const spotlight = new THREE.SpotLight(0xffd700, 1.5, 15, Math.PI / 6, 0.3, 2);
    spotlight.position.set(0, 8, 10);
    spotlight.target.position.set(0, 3, 15);

    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;

    scene.add(spotlight);
    scene.add(spotlight.target);
    this.lights.push({ name: 'thank-you-spotlight', light: spotlight });
  }

  /**
   * 创建交互区域
   */
  async createInteractionAreas() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 晚期展厅入口标记（返回）
    this.createEntranceMarker(
      new THREE.Vector3(0, 0, -18),
      'late',
      '晚期展厅',
      '#c9a227' // 深金色
    );

    // 序厅入口标记（重新开始）
    this.createEntranceMarker(
      new THREE.Vector3(-15, 0, 18),
      'intro',
      '返回序厅',
      '#c9a227' // 深金色
    );
  }

  /**
   * 创建入口标记
   */
  createEntranceMarker(position, hallId, hallName, color) {
    const { sceneManager } = this;
    const { scene } = sceneManager;

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
      description: '点击进入',
      interactable: true
    };
  }

  /**
   * 创建入口标记
   */
  createEntranceMarkers() {
    // 此方法已废弃，使用createInteractionAreas替代
    console.warn('createEntranceMarkers is deprecated, use createInteractionAreas instead');
  }

  /**
   * 设置相机位置
   */
  setupCameraPosition() {
    const { sceneManager } = this;
    if (sceneManager.camera) {
      // 设置初始相机位置（从后方进入）
      sceneManager.camera.position.set(0, 3, 15);
      sceneManager.camera.lookAt(0, 3, 0);

      // 设置控制器
      if (sceneManager.controls) {
        sceneManager.controls.target.set(0, 3, 0);
        sceneManager.controls.minDistance = 3;
        sceneManager.controls.maxDistance = 25;
      }
    }
  }

  /**
   * 获取入口标记
   */
  getEntranceMarkers() {
    return this.objects
      .filter((obj) => obj.name && obj.name.startsWith('entrance-marker-'))
      .map((obj) => ({
        position: obj.object.position,
        userData: obj.object.userData
      }));
  }
}
