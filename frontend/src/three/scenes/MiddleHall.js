/**
 * 盛期展厅 - 浑厚华滋时期（1930-1948）
 *
 * 展厅特点：
 * - 16m×80m×12m
 * - 三个区域：浑厚笔墨区、黄山写生区、笔墨大成区
 * - 9幅作品 + 360°全景展示
 * - 温暖厚重色调
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { HallScene } from './HallScene.js';

export class MiddleHall extends HallScene {
  constructor(sceneManager, config = {}) {
    super(sceneManager, {
      name: 'middle',
      displayName: '盛期展厅',
      description: '浑厚华滋 - 五笔七墨理论大成',
      width: 16,
      length: 80,
      height: 12,
      backgroundColor: 0x2a1f1a,
      wallColor: 0x9c8b6e, // 温暖的米褐色
      floorColor: 0x4a3728,
      ceilingColor: 0x8b7355,
      ...config
    });
  }

  /**
   * 创建展品
   */
  async createArtworks() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 浑厚笔墨区（1930-1937）
    await this.createThickInkArea();

    // 黄山写生区（1937-1945）
    await this.createHuangshanSketchArea();

    // 笔墨大成区（1945-1948）
    await this.createInkMasteryArea();

    // 360°全景展示区
    await this.createPanoramaDisplay();
  }

  /**
   * 浑厚笔墨区（1930-1937）
   */
  async createThickInkArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(-6, 3, -30), '浑厚笔墨', '1930-1937年\n笔墨锤炼期', {
      width: 4,
      height: 3
    });

    // 左墙作品
    this.addArtwork({
      id: 'middle-1-1',
      title: '墨巢图',
      year: '1934',
      description: '笔墨锤炼期的代表作品，技法成熟',
      position: new THREE.Vector3(-7.9, 3, -25),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-1-2',
      title: '峨嵋道中',
      year: '1934',
      description: '描绘峨眉山景，笔墨浑厚',
      position: new THREE.Vector3(-7.9, 3, -20),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-1-3',
      title: '拟笔山水',
      year: '1937',
      description: '拟古山水，笔墨大成',
      position: new THREE.Vector3(-7.9, 3, -15),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'thick-ink',
      name: '浑厚笔墨区',
      year: '1930-1937',
      description: '笔墨锤炼期',
      position: new THREE.Vector3(-6, 0, -25)
    });
  }

  /**
   * 黄山写生区（1937-1945）
   */
  async createHuangshanSketchArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(0, 3, 0), '黄山写生', '1937-1945年\n山水画实践', {
      width: 4,
      height: 3
    });

    // 右墙作品
    this.addArtwork({
      id: 'middle-2-1',
      title: '黄宾虹山水',
      year: '1940',
      description: '黄山写生代表作品，气势磅礴',
      position: new THREE.Vector3(7.9, 3, 5),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-2-2',
      title: '青绿山水',
      year: '1945',
      description: '青绿山水技法，色彩丰富',
      position: new THREE.Vector3(7.9, 3, 10),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-2-3',
      title: '黑宾虹山水',
      year: '1948',
      description: '黑宾虹风格，浑厚华滋',
      position: new THREE.Vector3(7.9, 3, 15),
      rotation: new THREE.Vector3(0, -Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'huangshan-sketch',
      name: '黄山写生区',
      year: '1937-1945',
      description: '山水画实践',
      position: new THREE.Vector3(6, 0, 10)
    });
  }

  /**
   * 笔墨大成区（1945-1948）
   */
  async createInkMasteryArea() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 区域介绍面板
    this.createInfoPanel(new THREE.Vector3(-6, 3, 30), '笔墨大成', '1945-1948年\n技法巅峰', {
      width: 4,
      height: 3
    });

    // 左墙作品
    this.addArtwork({
      id: 'middle-3-1',
      title: '墨山水',
      year: '1948',
      description: '笔墨大成期的代表作品，技法巅峰',
      position: new THREE.Vector3(-7.9, 3, 25),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-3-2',
      title: '黑宾虹山水',
      year: '1948',
      description: '黑宾虹风格的巅峰之作',
      position: new THREE.Vector3(-7.9, 3, 30),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    this.addArtwork({
      id: 'middle-3-3',
      title: '黄山胜景',
      year: '1948',
      description: '黄山美景的巅峰之作',
      position: new THREE.Vector3(-7.9, 3, 35),
      rotation: new THREE.Vector3(0, Math.PI / 2, 0),
      size: { width: 2.5, height: 2 }
    });

    // 记录区域信息
    this.layout.areas.push({
      id: 'ink-mastery',
      name: '笔墨大成区',
      year: '1945-1948',
      description: '技法巅峰',
      position: new THREE.Vector3(-6, 0, 30)
    });
  }

  /**
   * 360°全景展示区
   */
  async createPanoramaDisplay() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 创建360°全景展示面板
    const panelGeometry = new THREE.PlaneGeometry(4, 3);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x9c8b6e,
      roughness: 0.7,
      metalness: 0.2
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(6, 3, 0);
    panel.rotation.y = -Math.PI / 2;
    scene.add(panel);
    this.objects.push({ name: 'panorama-panel', object: panel });

    // 添加金色边框
    const frameGeometry = new THREE.BoxGeometry(4.2, 3.2, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.3,
      metalness: 0.7
    });

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(5.95, 3, 0);
    frame.rotation.y = -Math.PI / 2;
    scene.add(frame);
    this.objects.push({ name: 'panorama-frame', object: frame });

    // 设置交互数据
    panel.userData = {
      type: 'panorama',
      name: '360°全景展示',
      description: '黄山写生作品全景展示',
      interactive: true
    };
  }

  /**
   * 创建灯光
   */
  async createLights() {
    await super.createLights();

    // 为每个作品添加独立的聚光灯
    this.addArtworkSpotlights();
  }

  /**
   * 为作品添加聚光灯
   */
  addArtworkSpotlights() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 获取所有作品位置
    const artworkPositions = this.layout.artworks.map((art) => art.position);

    // 为每个作品创建聚光灯
    artworkPositions.forEach((pos, index) => {
      const spotlight = new THREE.SpotLight(0xffd700, 1.5, 15, Math.PI / 6, 0.3, 2);

      // 计算聚光灯位置（作品前方）
      const lightPos = pos.clone();
      lightPos.y = 8;

      if (pos.x < 0) {
        // 左墙作品，灯光从左侧照射
        lightPos.x = -5;
      } else {
        // 右墙作品，灯光从右侧照射
        lightPos.x = 5;
      }

      spotlight.position.copy(lightPos);
      spotlight.target.position.copy(pos);

      spotlight.castShadow = true;
      spotlight.shadow.mapSize.width = 1024;
      spotlight.shadow.mapSize.height = 1024;

      scene.add(spotlight);
      scene.add(spotlight.target);
      this.lights.push({ name: `artwork-spotlight-${index}`, light: spotlight });
    });
  }

  /**
   * 创建入口标记
   */
  createEntranceMarkers() {
    const { sceneManager } = this;
    const { scene } = sceneManager;

    // 早期展厅入口标记（返回）
    this.createEntranceMarker(new THREE.Vector3(-7, 0, -35), 'early', '早期展厅', '#ffd700');

    // 晚期展厅入口标记（前往）
    this.createEntranceMarker(new THREE.Vector3(7, 0, 35), 'late', '晚期展厅', '#ffd700');
  }

  /**
   * 设置相机位置
   */
  setupCameraPosition() {
    const { sceneManager } = this;
    if (sceneManager.camera) {
      // 设置初始相机位置
      sceneManager.camera.position.set(0, 3, -5);
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

  /**
   * 获取指定区域的作品
   */
  getArtworksByArea(areaId) {
    return this.layout.artworks.filter((artwork) => {
      const area = this.layout.areas.find((a) => a.id === areaId);
      if (!area) return false;

      const distance = artwork.position.distanceTo(area.position);
      return distance < 15;
    });
  }
}
