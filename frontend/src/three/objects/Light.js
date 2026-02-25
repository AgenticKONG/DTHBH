/**
 * 灯光类
 *
 * 职责:
 * - 创建不同类型的灯光（环境光、方向光、点光源、聚光灯）
 * - 支持灯光动画
 * - 支持阴影配置
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class Light {
  constructor(config = {}) {
    this.config = {
      type: 'ambient', // ambient, directional, point, spot
      color: 0xffffff,
      intensity: 1,
      position: { x: 0, y: 5, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      castShadow: false,
      shadowMapSize: 2048,
      ...config
    };

    this.light = null;
    this.targetObject = null;
  }

  /**
   * 创建灯光
   */
  create(scene) {
    let light;

    switch (this.config.type) {
      case 'ambient':
        light = new THREE.AmbientLight(this.config.color, this.config.intensity);
        break;

      case 'directional':
        light = new THREE.DirectionalLight(this.config.color, this.config.intensity);
        this.setupDirectionalLight(light);
        break;

      case 'point':
        light = new THREE.PointLight(this.config.color, this.config.intensity);
        this.setupPointLight(light);
        break;

      case 'spot':
        light = new THREE.SpotLight(this.config.color, this.config.intensity);
        this.setupSpotLight(light);
        break;

      default:
        throw new Error(`Unknown light type: ${this.config.type}`);
    }

    // 设置位置
    if (light.position) {
      light.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
    }

    this.light = light;
    scene.add(light);

    console.log(`Light created: ${this.config.type}`);
  }

  /**
   * 设置方向光
   */
  setupDirectionalLight(light) {
    light.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

    if (this.config.castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize;
      light.shadow.mapSize.height = this.config.shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 50;
      light.shadow.camera.left = -10;
      light.shadow.camera.right = 10;
      light.shadow.camera.top = 10;
      light.shadow.camera.bottom = -10;
    }
  }

  /**
   * 设置点光源
   */
  setupPointLight(light) {
    light.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

    if (this.config.castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize;
      light.shadow.mapSize.height = this.config.shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 25;
    }
  }

  /**
   * 设置聚光灯
   */
  setupSpotLight(light) {
    light.position.set(this.config.position.x, this.config.position.y, this.config.position.z);

    // 设置目标
    this.targetObject = new THREE.Object3D();
    this.targetObject.position.set(this.config.target.x, this.config.target.y, this.config.target.z);
    light.add(this.targetObject);
    light.target = this.targetObject;

    // 默认参数
    light.angle = Math.PI / 6;
    light.penumbra = 0.3;
    light.decay = 2;
    light.distance = 10;

    if (this.config.castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = this.config.shadowMapSize;
      light.shadow.mapSize.height = this.config.shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 25;
    }
  }

  /**
   * 设置聚光灯角度
   */
  setSpotlightAngle(angle) {
    if (this.light && this.light.angle !== undefined) {
      this.light.angle = angle;
    }
  }

  /**
   * 设置聚光灯半影
   */
  setSpotlightPenumbra(penumbra) {
    if (this.light && this.light.penumbra !== undefined) {
      this.light.penumbra = penumbra;
    }
  }

  /**
   * 设置聚光灯距离
   */
  setSpotlightDistance(distance) {
    if (this.light && this.light.distance !== undefined) {
      this.light.distance = distance;
    }
  }

  /**
   * 动画灯光强度
   */
  animateIntensity(targetIntensity, duration = 1) {
    if (this.light) {
      gsap.to(this.light, {
        intensity: targetIntensity,
        duration,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * 动画灯光颜色
   */
  animateColor(targetColor, duration = 1) {
    if (this.light && this.light.color) {
      const color = new THREE.Color(targetColor);
      gsap.to(this.light.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * 动画灯光位置
   */
  animatePosition(targetPosition, duration = 1) {
    if (this.light && this.light.position) {
      gsap.to(this.light.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration,
        ease: 'power2.inOut'
      });
    }
  }

  /**
   * 获取灯光
   */
  getLight() {
    return this.light;
  }

  /**
   * 设置灯光强度
   */
  setIntensity(intensity) {
    if (this.light) {
      this.light.intensity = intensity;
    }
  }

  /**
   * 设置灯光颜色
   */
  setColor(color) {
    if (this.light && this.light.color) {
      this.light.color.set(color);
    }
  }

  /**
   * 销毁灯光
   */
  destroy() {
    if (this.light && this.light.parent) {
      this.light.parent.remove(this.light);
    }

    this.light = null;
    this.targetObject = null;

    console.log('Light destroyed');
  }
}
