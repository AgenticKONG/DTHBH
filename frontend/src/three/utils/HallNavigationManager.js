/**
 * 展厅导航管理器
 *
 * 职责:
 * - 管理展厅导航界面
 * - 展厅快速切换
 * - 路线指引
 * - 展厅缩略图
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class HallNavigationManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;

    // 展厅列表
    this.halls = [];

    // 当前展厅
    this.currentHallId = null;

    // 导航界面
    this.navigationUI = null;

    // 缩略图
    this.thumbnails = new Map();

    // 路线指引
    this.guidePath = [];

    // 回调函数
    this.callbacks = {
      onHallSwitch: null,
      onThumbnailClick: null,
      onPathComplete: null
    };
  }

  /**
   * 初始化展厅导航管理器
   */
  initialize(halls) {
    this.halls = halls;
    console.log('HallNavigationManager initialized with', halls.length, 'halls');
  }

  /**
   * 创建导航界面
   */
  createNavigationUI() {
    const { scene } = this;

    // 创建导航面板
    const panelGeometry = new THREE.PlaneGeometry(6, 4);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    this.navigationUI = new THREE.Mesh(panelGeometry, panelMaterial);
    this.navigationUI.position.set(0, 3, -8);
    this.navigationUI.visible = false;
    scene.add(this.navigationUI);

    // 创建展厅按钮
    this.createHallButtons();

    // 创建路线指引
    this.createGuidePath();
  }

  /**
   * 创建展厅按钮
   */
  createHallButtons() {
    const buttonWidth = 1.2;
    const buttonHeight = 0.5;
    const spacing = 0.2;
    const startY = 3.5;

    this.halls.forEach((hall, index) => {
      const buttonGeometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
      const buttonMaterial = new THREE.MeshStandardMaterial({
        color: 0x5c4033,
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide
      });

      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(
        -2 + (index % 3) * (buttonWidth + spacing),
        startY - Math.floor(index / 3) * (buttonHeight + spacing),
        -7.9
      );
      button.visible = false;

      // 设置展厅数据
      button.userData = {
        type: 'hall-button',
        hallId: hall.id,
        hallName: hall.name,
        hallDescription: hall.description,
        interactive: true
      };

      this.scene.add(button);
      this.thumbnails.set(hall.id, button);
    });
  }

  /**
   * 创建路线指引
   */
  createGuidePath() {
    const { scene } = this;

    // 创建路线点
    this.guidePath = this.halls.map((hall, index) => ({
      position: new THREE.Vector3(-3 + index * 1.5, 2, -6 - Math.floor(index / 3) * 1.5),
      hallId: hall.id,
      hallName: hall.name
    }));

    // 创建路线线
    const points = this.guidePath.map((p) => p.position);
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.6
    });

    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.visible = false;
    scene.add(tube);
    this.guidePathMesh = tube;

    // 创建路线点标记
    this.guidePath.forEach((point, index) => {
      const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x00ff00 : index === this.halls.length - 1 ? 0xff0000 : 0xffd700
      });

      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(point.position);
      marker.visible = false;

      marker.userData = {
        type: 'path-marker',
        hallId: point.hallId,
        hallName: point.hallName,
        index: index,
        interactive: true
      };

      scene.add(marker);
      this.thumbnails.set(`path-marker-${index}`, marker);
    });
  }

  /**
   * 显示导航界面
   */
  showNavigationUI() {
    if (this.navigationUI) {
      this.navigationUI.visible = true;

      // 动画显示
      gsap.from(this.navigationUI.position, {
        z: -12,
        duration: 0.5,
        ease: 'power2.out'
      });

      // 显示所有展厅按钮
      this.thumbnails.forEach((thumbnail) => {
        if (thumbnail.userData.type === 'hall-button') {
          thumbnail.visible = true;
          gsap.from(thumbnail.position, {
            z: -10,
            duration: 0.3,
            delay: Math.random() * 0.2,
            ease: 'power2.out'
          });
        }
      });

      // 显示路线
      if (this.guidePathMesh) {
        this.guidePathMesh.visible = true;
        gsap.from(this.guidePathMesh.material, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out'
        });
      }

      // 显示路线点标记
      this.thumbnails.forEach((thumbnail) => {
        if (thumbnail.userData.type === 'path-marker') {
          thumbnail.visible = true;
          gsap.from(thumbnail.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.3,
            delay: Math.random() * 0.3,
            ease: 'back.out(1.7)'
          });
        }
      });
    }
  }

  /**
   * 隐藏导航界面
   */
  hideNavigationUI() {
    if (this.navigationUI) {
      // 动画隐藏
      gsap.to(this.navigationUI.position, {
        z: -12,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.navigationUI.visible = false;
        }
      });

      // 隐藏所有展厅按钮
      this.thumbnails.forEach((thumbnail) => {
        thumbnail.visible = false;
      });

      // 隐藏路线
      if (this.guidePathMesh) {
        this.guidePathMesh.visible = false;
      }
    }
  }

  /**
   * 切换到指定展厅
   */
  async switchToHall(hallId) {
    const hall = this.halls.find((h) => h.id === hallId);
    if (!hall) {
      console.warn(`Hall not found: ${hallId}`);
      return;
    }

    this.currentHallId = hallId;

    // 触发回调
    if (this.callbacks.onHallSwitch) {
      this.callbacks.onHallSwitch(hallId);
    }

    // 隐藏导航界面
    this.hideNavigationUI();

    console.log(`Switched to hall: ${hall.name}`);
  }

  /**
   * 设置当前展厅
   */
  setCurrentHall(hallId) {
    this.currentHallId = hallId;

    // 更新展厅按钮高亮
    this.thumbnails.forEach((thumbnail) => {
      if (thumbnail.userData.type === 'hall-button') {
        const isActive = thumbnail.userData.hallId === hallId;
        thumbnail.material.color.setHex(isActive ? 0xffd700 : 0x5c4033);
      }

      if (thumbnail.userData.type === 'path-marker') {
        const isCurrent = thumbnail.userData.hallId === hallId;
        thumbnail.material.color.setHex(isCurrent ? 0x00ff00 : 0xffd700);
      }
    });
  }

  /**
   * 创建展厅缩略图（3D）
   */
  createThumbnail(hallId, hallScene) {
    const { scene } = this;

    // 创建缩略图容器
    const containerGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
    const containerMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.8,
      metalness: 0.2
    });

    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.visible = false;

    // 创建缩略图场景
    const thumbnailScene = new THREE.Scene();
    thumbnailScene.background = new THREE.Color(0x2a1f1a);

    // 创建缩略图相机
    const thumbnailCamera = new THREE.PerspectiveCamera(75, 2 / 1.5, 0.1, 100);
    thumbnailCamera.position.set(0, 3, 5);
    thumbnailCamera.lookAt(0, 1.5, 0);

    // 创建缩略图渲染器
    const thumbnailRenderer = new THREE.WebGLRenderer({ antialias: true });
    thumbnailRenderer.setSize(256, 192);
    thumbnailRenderer.render(thumbnailScene, thumbnailCamera);

    // 将渲染结果作为纹理
    const texture = new THREE.CanvasTexture(thumbnailRenderer.domElement);

    // 创建缩略图面板
    const panelGeometry = new THREE.PlaneGeometry(1.8, 1.3);
    const panelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9
    });

    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.z = 0.06;
    container.add(panel);

    // 设置展厅数据
    const hall = this.halls.find((h) => h.id === hallId);
    container.userData = {
      type: 'thumbnail',
      hallId: hallId,
      hallName: hall ? hall.name : '',
      hallDescription: hall ? hall.description : '',
      interactive: true
    };

    scene.add(container);
    this.thumbnails.set(`thumbnail-${hallId}`, container);

    return container;
  }

  /**
   * 显示缩略图
   */
  showThumbnails() {
    const thumbnailSpacing = 2.5;
    const thumbnailStartX = (-(this.halls.length - 1) * thumbnailSpacing) / 2;

    this.halls.forEach((hall, index) => {
      const thumbnail = this.thumbnails.get(`thumbnail-${hall.id}`);
      if (thumbnail) {
        thumbnail.position.set(thumbnailStartX + index * thumbnailSpacing, 3, -5);
        thumbnail.visible = true;

        gsap.from(thumbnail.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'back.out(1.7)'
        });

        gsap.from(thumbnail.rotation, {
          y: Math.PI,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power2.out'
        });
      }
    });
  }

  /**
   * 隐藏缩略图
   */
  hideThumbnails() {
    this.thumbnails.forEach((thumbnail) => {
      if (thumbnail.userData.type === 'thumbnail') {
        thumbnail.visible = false;
      }
    });
  }

  /**
   * 获取展厅信息
   */
  getHallInfo(hallId) {
    return this.halls.find((h) => h.id === hallId);
  }

  /**
   * 获取所有展厅
   */
  getAllHalls() {
    return [...this.halls];
  }

  /**
   * 设置回调
   */
  setCallback(event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * 销毁展厅导航管理器
   */
  destroy() {
    const { scene } = this;

    // 移除导航界面
    if (this.navigationUI) {
      scene.remove(this.navigationUI);
      this.navigationUI = null;
    }

    // 移除路线
    if (this.guidePathMesh) {
      scene.remove(this.guidePathMesh);
      this.guidePathMesh = null;
    }

    // 移除所有缩略图
    this.thumbnails.forEach((thumbnail) => {
      scene.remove(thumbnail);
    });

    this.thumbnails.clear();

    // 清空数据
    this.halls = [];
    this.currentHallId = null;
    this.guidePath = [];

    // 清空回调
    this.callbacks = {
      onHallSwitch: null,
      onThumbnailClick: null,
      onPathComplete: null
    };

    console.log('HallNavigationManager destroyed');
  }
}
