/**
 * 晚期展厅 - 黑宾虹大成时期（1948-1955）
 *
 * 展厅特点：
 * - 12m×60m×10m
 * - 三个区域：积墨大成区、焦墨宿墨区、艺术升华区
 * - 8幅作品 + 绝笔作品展示区
 * - 深邃厚重色调
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { HallScene } from './HallScene.js';

export class LateHall extends HallScene {
  constructor(sceneManager, config = {}) {
    super(sceneManager, {
      name: 'late',
      displayName: '晚期展厅',
      description: '黑密厚重 - 艺术升华与绝笔作品',
      width: 12,
      length: 60,
      height: 10,
      backgroundColor: 0x1a1510, // 更深的背景色
      wallColor: 0x5c4033, // 深褐色墙面
      floorColor: 0x2a1f1a, // 深色地面
      ceilingColor: 0x3d2817, // 深色顶棚
      ...config
    });
  }

  /**
   * 创建展品
   */
  async createArtworks() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 积墨大成区（1948-1952）
    await this.createAccumulatedInkArea();

    // 焦墨宿墨区（1952-1954）
    await this.createBurntInkArea();

    // 艺术升华区（1954-1955）
    await this.createArtisticSublimationArea();

    // 绝笔作品展示区
    await this.createFinalWorkDisplay();
  }

  /**
   * 积墨大成区（1948-1952）
   */
  async createAccumulatedInkArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(-4, 3, -22), '积墨大成', '1948-1952年\n技法巅峰期', {
      width: 3.5,
      height: 2.5
    });

    // 左墙作品
    this.addArtwork({
      id: 'late-1-1',
      title: '墨山水',
      year: '1952',
      description: '技法巅峰期的代表作品，墨色极重',
      position: new THREE.Vector3(-5.9, 3, -20),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'late-1-2',
      title: '黑宾虹山水',
      year: '1952',
      description: '黑宾虹风格，笔法苍劲',
      position: new THREE.Vector3(-5.9, 3, -15),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'accumulated-ink',
      name: '积墨大成区',
      year: '1948-1952',
      description: '技法巅峰',
      position: new THREE.Vector3(-4, 0, -18)
    });
  }

  /**
   * 焦墨宿墨区（1952-1954）
   */
  async createBurntInkArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(0, 3, 0), '焦墨宿墨', '1952-1954年\n技法突破', {
      width: 3.5,
      height: 2.5
    });

    // 右墙作品
    this.addArtwork({
      id: 'late-2-1',
      title: '晚年山水',
      year: '1953',
      description: '焦墨宿墨技法，极致厚重',
      position: new THREE.Vector3(5.9, 3, 5),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'late-2-2',
      title: '晚期山水',
      year: '1954',
      description: '意境深远，技法大成',
      position: new THREE.Vector3(5.9, 3, 10),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'late-2-3',
      title: '黑宾虹山水',
      year: '1954',
      description: '黑宾虹风格的巅峰',
      position: new THREE.Vector3(5.9, 3, 15),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'burnt-ink',
      name: '焦墨宿墨区',
      year: '1952-1954',
      description: '技法突破',
      position: new THREE.Vector3(4, 0, 10)
    });
  }

  /**
   * 艺术升华区（1954-1955）
   */
  async createArtisticSublimationArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(-4, 3, 22), '艺术升华', '1954-1955年\n人画合一', {
      width: 3.5,
      height: 2.5
    });

    // 左墙作品
    this.addArtwork({
      id: 'late-3-1',
      title: '绝笔山水',
      year: '1955',
      description: '艺术升华期的代表作品，人画俱老',
      position: new THREE.Vector3(-5.9, 3, 20),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'late-3-2',
      title: '黑宾虹绝笔',
      year: '1955',
      description: '黄宾虹的绝笔之作，艺术巅峰',
      position: new THREE.Vector3(-5.9, 3, 25),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'late-3-3',
      title: '黄宾虹山水',
      year: '1955',
      description: '晚年的巅峰之作',
      position: new THREE.Vector3(-5.9, 3, 28),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'artistic-sublimation',
      name: '艺术升华区',
      year: '1954-1955',
      description: '人画合一',
      position: new THREE.Vector3(-4, 0, 24)
    });
  }

  /**
   * 绝笔作品展示区
   */
  async createFinalWorkDisplay() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建绝笔作品展示面板
    const panelGeometry = new THREE.PlaneGeometry(3.5, 2.5);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.8,
      metalness: 0.2
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(4, 3, 0);
    panel.rotation.y = -Math.PI / 2;
    scene.add(panel);
    this.objects.push({ name: 'final-work-panel', object: panel });

    // 深金色边框（更庄重）
    const frameGeometry = new THREE.BoxGeometry(3.7, 2.7, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a227, // 深金色
      roughness: 0.3,
      metalness: 0.8
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(3.95, 3, 0);
    frame.rotation.y = -Math.PI / 2;
    scene.add(frame);
    this.objects.push({ name: 'final-work-frame', object: frame });

    // 添加发光效果
    const glowGeometry = new THREE.BoxGeometry(3.9, 2.9, 0.05);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(3.92, 3, 0);
    glow.rotation.y = -Math.PI / 2;
    scene.add(glow);
    this.objects.push({ name: 'final-work-glow', object: glow });

    // 设置交互数据
    panel.userData = {
      type: 'final-work',
      name: '绝笔作品展示',
      description: '黄宾虹晚年的绝笔之作，艺术巅峰',
      interactive: true
    };
  }

  /**
   * 创建灯光
   */
  async createLights() {
    await super.createLights();

    // 调整环境光为更深的色调
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 移除默认环境光
    const ambient = this.lights.find((l) => l.name === 'ambient');
    if (ambient) {
      scene.remove(ambient.light);
      this.lights = this.lights.filter((l) => l.name !== 'ambient');
    }

    // 创建更深的环境光
    const newAmbient = new THREE.AmbientLight(0x3d2817, 0.3);
    scene.add(newAmbient);
    this.lights.push({ name: 'ambient', light: newAmbient });

    // 为每个作品添加独立的强聚光灯
    this.addArtworkSpotlights();

    // 为绝笔作品添加特殊光照
    this.addFinalWorkSpotlight();
  }

  /**
   * 为作品添加聚光灯（更强、更聚焦）
   */
  addArtworkSpotlights() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 获取所有作品位置
    const artworkPositions = this.layout.artworks.map((art) => art.position);

    // 为每个作品创建聚光灯
    artworkPositions.forEach((pos, index) => {
      const spotlight = new THREE.SpotLight(0xffd700, 2, 15, Math.PI / 8, 0.5, 2); // 更强、更聚焦

      // 计算聚光灯位置（作品前方）
      const lightPos = pos.clone();
      lightPos.y = 8;

      if (pos.x < 0) {
        // 左墙作品，灯光从左侧照射
        lightPos.x = -4;
      } else {
        // 右墙作品，灯光从右侧照射
        lightPos.x = 4;
      }

      spotlight.position.copy(lightPos);
      spotlight.target.position.copy(pos);

      spotlight.castShadow = true;
      spotlight.shadow.mapSize.width = 1024;
      spotlight.shadow.mapSize.height = 1024;
      spotlight.shadow.bias = -0.0001;

      scene.add(spotlight);
      scene.add(spotlight.target);
      this.lights.push({ name: `artwork-spotlight-${index}`, light: spotlight });
    });
  }

  /**
   * 为绝笔作品添加特殊聚光灯
   */
  addFinalWorkSpotlight() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建金色聚光灯
    const spotlight = new THREE.SpotLight(0xffd700, 3, 12, Math.PI / 6, 0.3, 2);
    spotlight.position.set(4, 9, 0);
    spotlight.target.position.set(3.9, 3, 0);

    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    spotlight.shadow.bias = -0.0001;

    scene.add(spotlight);
    scene.add(spotlight.target);
    this.lights.push({ name: 'final-work-spotlight', light: spotlight });
  }

  /**
   * 创建入口标记
   */
  createEntranceMarkers() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 盛期展厅入口标记（返回）
    this.createEntranceMarker(
      new THREE.Vector3(-5, 0, -27),
      'middle',
      '盛期展厅',
      '#c9a227' // 深金色
    );

    // 尾厅入口标记（前往）
    this.createEntranceMarker(
      new THREE.Vector3(5, 0, 27),
      'end',
      '尾厅',
      '#c9a227' // 深金色
    );
  }

  /**
   * 设置相机位置
   */
  setupCameraPosition() {
    const { sceneManager } = this;
    if (sceneManager.camera) {
      // 设置初始相机位置
      sceneManager.camera.position.set(0, 2.5, -5);
      sceneManager.camera.lookAt(0, 2.5, 0);

      // 设置控制器
      if (sceneManager.controls) {
        sceneManager.controls.target.set(0, 2.5, 0);
        sceneManager.controls.minDistance = 2.5;
        sceneManager.controls.maxDistance = 20;
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

  /**
   * 获取指定区域的作品
   */
  getArtworksByArea(areaId) {
    return this.layout.artworks.filter((artwork) => {
      const area = this.layout.areas.find((a) => a.id === areaId);
      if (!area) return false;

      const distance = artwork.position.distanceTo(area.position);
      return distance < 12;
    });
  }
}
