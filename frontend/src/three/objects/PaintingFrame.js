/**
 * 画框类
 *
 * 职责:
 * - 创建画框（外框、内框、画布）
 * - 加载画作纹理
 * - 创建聚光灯
 * - 实现交互功能（悬停、点击、双击）
 * - 管理画框状态（正常、悬停、选中）
 *
 * 尺寸规范（来自设计文档）:
 * - 外框宽度: 12px
 * - 内框宽度: 8px
 * - 画布宽度: 根据画作尺寸
 * - 总宽度: 外框 + 内框 + 画布 + 内框 + 外框
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class PaintingFrame {
  constructor(config = {}) {
    this.config = {
      id: '',
      title: '',
      artist: '黄宾虹',
      year: '',
      description: '',
      // 尺寸（单位：米）
      width: 1.2,
      height: 0.8,
      // 颜色（来自UI设计规范）
      frameColor: 0x8b7355,
      innerFrameColor: 0x5c4033,
      canvasColor: 0xffffff,
      // 位置
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      // 画作
      image: null,
      thumbnail: null,
      // 交互
      interactive: true,
      // 聚光灯
      enableSpotlight: true,
      spotlightColor: 0xffd700,
      spotlightIntensity: 2,
      ...config
    };

    this.mesh = null;
    this.group = null;
    this.spotlight = null;
    this.materials = {};
    this.geometries = {};
    this.textures = {};

    // 交互状态
    this.state = {
      normal: {
        scale: 1,
        frameColor: this.config.frameColor,
        spotlightIntensity: this.config.spotlightIntensity
      },
      hover: {
        scale: 1.05,
        frameColor: 0xffd700,
        spotlightIntensity: 3
      },
      selected: {
        scale: 1.1,
        frameColor: 0xffd700,
        spotlightIntensity: 4
      },
      current: 'normal'
    };

    // 事件回调
    this.callbacks = {
      onHover: null,
      onClick: null,
      onDoubleClick: null,
      onRightClick: null
    };

    // 射线检测
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * 创建画框
   */
  async create(scene) {
    try {
      // 创建组
      this.group = new THREE.Group();
      this.group.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
      this.group.rotation.set(this.config.rotation.x, this.config.rotation.y, this.config.rotation.z);

      // 计算画框尺寸
      const frameThickness = 0.012; // 外框厚度 12px = 0.012m
      const innerFrameThickness = 0.008; // 内框厚度 8px = 0.008m
      const canvasWidth = this.config.width;
      const canvasHeight = this.config.height;
      const totalWidth = canvasWidth + 2 * (frameThickness + innerFrameThickness);
      const totalHeight = canvasHeight + 2 * (frameThickness + innerFrameThickness);

      // 创建外框
      await this.createOuterFrame(totalWidth, totalHeight, frameThickness);

      // 创建内框
      await this.createInnerFrame(canvasWidth, canvasHeight, innerFrameThickness, frameThickness);

      // 创建画布
      await this.createCanvas(canvasWidth, canvasHeight, innerFrameThickness, frameThickness);

      // 创建聚光灯
      if (this.config.enableSpotlight) {
        await this.createSpotlight(totalWidth, totalHeight);
      }

      // 添加到场景
      scene.add(this.group);

      console.log(`PaintingFrame created: ${this.config.title}`);
    } catch (error) {
      console.error(`Failed to create PaintingFrame: ${this.config.title}`, error);
      throw error;
    }
  }

  /**
   * 创建外框
   */
  async createOuterFrame(width, height, thickness) {
    const frameGeometry = new THREE.BoxGeometry(width, height, thickness);
    this.geometries.outerFrame = frameGeometry;

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: this.config.frameColor,
      roughness: 0.6,
      metalness: 0.3
    });
    this.materials.outerFrame = frameMaterial;

    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.z = thickness / 2;
    frame.castShadow = true;
    frame.receiveShadow = true;

    this.group.add(frame);
    this.mesh = frame;
  }

  /**
   * 创建内框
   */
  async createInnerFrame(canvasWidth, canvasHeight, thickness, outerThickness) {
    const innerWidth = canvasWidth + thickness;
    const innerHeight = canvasHeight + thickness;

    const innerFrameGeometry = new THREE.BoxGeometry(innerWidth, innerHeight, thickness);
    this.geometries.innerFrame = innerFrameGeometry;

    const innerFrameMaterial = new THREE.MeshStandardMaterial({
      color: this.config.innerFrameColor,
      roughness: 0.5,
      metalness: 0.2
    });
    this.materials.innerFrame = innerFrameMaterial;

    const innerFrame = new THREE.Mesh(innerFrameGeometry, innerFrameMaterial);
    innerFrame.position.z = outerThickness + thickness / 2;
    innerFrame.castShadow = true;
    innerFrame.receiveShadow = true;

    this.group.add(innerFrame);
  }

  /**
   * 创建画布
   */
  async createCanvas(width, height, innerThickness, outerThickness) {
    const canvasGeometry = new THREE.PlaneGeometry(width, height);
    this.geometries.canvas = canvasGeometry;

    let canvasMaterial;

    if (this.config.image) {
      // 加载画作纹理
      const textureLoader = new THREE.TextureLoader();
      try {
        const texture = await new Promise((resolve, reject) => {
          textureLoader.load(this.config.image, resolve, undefined, reject);
        });
        this.textures.image = texture;

        canvasMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.8,
          metalness: 0.0
        });
      } catch (error) {
        console.warn(`Failed to load image: ${this.config.image}`, error);
        // 使用默认颜色
        canvasMaterial = new THREE.MeshStandardMaterial({
          color: this.config.canvasColor,
          roughness: 0.8,
          metalness: 0.0
        });
      }
    } else {
      // 使用默认颜色
      canvasMaterial = new THREE.MeshStandardMaterial({
        color: this.config.canvasColor,
        roughness: 0.8,
        metalness: 0.0
      });
    }

    this.materials.canvas = canvasMaterial;

    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
    canvas.position.z = outerThickness + innerThickness + 0.001;
    canvas.castShadow = true;
    canvas.receiveShadow = true;

    // 添加到画框组
    this.group.add(canvas);

    // 添加到交互列表
    if (this.config.interactive) {
      canvas.userData = {
        isInteractive: true,
        paintingFrame: this
      };
    }
  }

  /**
   * 创建聚光灯
   */
  async createSpotlight(frameWidth, frameHeight) {
    const distance = 3; // 灯光距离
    const angle = Math.atan2(frameHeight / 2, distance);

    const spotlight = new THREE.SpotLight(this.config.spotlightColor, this.config.spotlightIntensity);
    spotlight.position.set(0, 0, distance);
    spotlight.angle = angle * 1.5;
    spotlight.penumbra = 0.3;
    spotlight.decay = 1;
    spotlight.distance = distance * 2;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;

    // 目标位置
    const target = new THREE.Object3D();
    target.position.set(0, 0, 0);
    this.group.add(target);
    spotlight.target = target;

    this.group.add(spotlight);
    this.spotlight = spotlight;
  }

  /**
   * 处理悬停事件
   */
  handleHover() {
    if (this.state.current === 'hover') return;

    this.state.current = 'hover';

    // 动画过渡
    gsap.to(this.group.scale, {
      x: this.state.hover.scale,
      y: this.state.hover.scale,
      z: this.state.hover.scale,
      duration: 0.3,
      ease: 'power2.out'
    });

    // 改变外框颜色
    if (this.materials.outerFrame) {
      gsap.to(this.materials.outerFrame.color, {
        r: new THREE.Color(this.state.hover.frameColor).r,
        g: new THREE.Color(this.state.hover.frameColor).g,
        b: new THREE.Color(this.state.hover.frameColor).b,
        duration: 0.3
      });
    }

    // 增强聚光灯
    if (this.spotlight) {
      gsap.to(this.spotlight, {
        intensity: this.state.hover.spotlightIntensity,
        duration: 0.3
      });
    }

    // 触发回调
    if (this.callbacks.onHover) {
      this.callbacks.onHover(this);
    }
  }

  /**
   * 处理离开事件
   */
  handleLeave() {
    if (this.state.current === 'normal') return;

    const targetState = this.state.current === 'selected' ? this.state.selected : this.state.normal;
    const targetName = this.state.current === 'selected' ? 'selected' : 'normal';

    this.state.current = targetName;

    // 动画过渡
    gsap.to(this.group.scale, {
      x: targetState.scale,
      y: targetState.scale,
      z: targetState.scale,
      duration: 0.3,
      ease: 'power2.out'
    });

    // 恢复外框颜色
    if (this.materials.outerFrame) {
      gsap.to(this.materials.outerFrame.color, {
        r: new THREE.Color(targetState.frameColor).r,
        g: new THREE.Color(targetState.frameColor).g,
        b: new THREE.Color(targetState.frameColor).b,
        duration: 0.3
      });
    }

    // 恢复聚光灯
    if (this.spotlight) {
      gsap.to(this.spotlight, {
        intensity: targetState.spotlightIntensity,
        duration: 0.3
      });
    }
  }

  /**
   * 处理点击事件
   */
  handleClick() {
    // 切换选中状态
    if (this.state.current === 'selected') {
      this.handleLeave();
    } else {
      this.state.current = 'selected';

      // 动画过渡
      gsap.to(this.group.scale, {
        x: this.state.selected.scale,
        y: this.state.selected.scale,
        z: this.state.selected.scale,
        duration: 0.3,
        ease: 'power2.out'
      });

      // 改变外框颜色
      if (this.materials.outerFrame) {
        gsap.to(this.materials.outerFrame.color, {
          r: new THREE.Color(this.state.selected.frameColor).r,
          g: new THREE.Color(this.state.selected.frameColor).g,
          b: new THREE.Color(this.state.selected.frameColor).b,
          duration: 0.3
        });
      }

      // 增强聚光灯
      if (this.spotlight) {
        gsap.to(this.spotlight, {
          intensity: this.state.selected.spotlightIntensity,
          duration: 0.3
        });
      }
    }

    // 触发回调
    if (this.callbacks.onClick) {
      this.callbacks.onClick(this, this.state.current === 'selected');
    }
  }

  /**
   * 处理双击事件
   */
  handleDoubleClick() {
    // 触发回调
    if (this.callbacks.onDoubleClick) {
      this.callbacks.onDoubleClick(this);
    }
  }

  /**
   * 处理右键点击事件
   */
  handleRightClick() {
    // 触发回调
    if (this.callbacks.onRightClick) {
      this.callbacks.onRightClick(this);
    }
  }

  /**
   * 设置事件回调
   */
  setCallback(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * 获取画框信息
   */
  getInfo() {
    return {
      id: this.config.id,
      title: this.config.title,
      artist: this.config.artist,
      year: this.config.year,
      description: this.config.description,
      image: this.config.image,
      thumbnail: this.config.thumbnail,
      state: this.state.current
    };
  }

  /**
   * 销毁画框
   */
  async destroy() {
    // 停止所有动画
    gsap.killTweensOf(this.group.scale);
    if (this.materials.outerFrame) {
      gsap.killTweensOf(this.materials.outerFrame.color);
    }
    if (this.spotlight) {
      gsap.killTweensOf(this.spotlight);
    }

    // 释放几何体
    Object.values(this.geometries).forEach((geometry) => {
      if (geometry) {
        geometry.dispose();
      }
    });
    this.geometries = {};

    // 释放材质
    Object.values(this.materials).forEach((material) => {
      if (material) {
        material.dispose();
      }
    });
    this.materials = {};

    // 释放纹理
    Object.values(this.textures).forEach((texture) => {
      if (texture) {
        texture.dispose();
      }
    });
    this.textures = {};

    // 从场景中移除
    if (this.group && this.group.parent) {
      this.group.parent.remove(this.group);
    }

    this.group = null;
    this.mesh = null;
    this.spotlight = null;

    console.log(`PaintingFrame destroyed: ${this.config.title}`);
  }
}
