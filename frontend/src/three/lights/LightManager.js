/**
 * 灯光管理器
 *
 * 职责:
 * - 管理场景中所有灯光的创建、更新和销毁
 * - 提供灯光组管理（环境光、主光、补光等）
 * - 支持灯光动画和渐变
 * - 优化灯光性能
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class LightManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.lights = new Map(); // 灯光缓存
    this.lightGroups = new Map(); // 灯光组
    this.animations = new Map(); // 灯光动画

    // 灯光配置
    this.config = {
      enableShadows: options.enableShadows !== false,
      shadowMapSize: options.shadowMapSize || 2048,
      maxShadowLights: options.maxShadowLights || 4,
      maxPointLights: options.maxPointLights || 10,
      maxSpotLights: options.maxSpotLights || 8,
      enableLightHelpers: options.enableLightHelpers || false
    };

    // 统计信息
    this.stats = {
      ambientLights: 0,
      directionalLights: 0,
      pointLights: 0,
      spotLights: 0,
      hemisphereLights: 0
    };

    // 预设灯光配置（来自材质光影规范.md）
    this.presetLights = {
      // 环境光
      ambient: {
        type: 'ambient',
        name: '环境光',
        color: 0xffffff,
        intensity: 0.4,
        description: '基础环境照明'
      },

      // 主光
      mainLight: {
        type: 'directional',
        name: '主光',
        color: 0xffffff,
        intensity: 0.8,
        position: { x: 5, y: 10, z: 5 },
        castShadow: true,
        description: '主要光源，产生阴影'
      },

      // 补光
      fillLight: {
        type: 'directional',
        name: '补光',
        color: 0xffd700,
        intensity: 0.3,
        position: { x: -5, y: 5, z: -5 },
        description: '补充光线，暖色调'
      },

      // 聚光灯（用于照亮展品）
      spotlight: {
        type: 'spot',
        name: '聚光灯',
        color: 0xffffff,
        intensity: 2,
        position: { x: 0, y: 5, z: 3 },
        angle: Math.PI / 6,
        penumbra: 0.3,
        distance: 10,
        castShadow: true,
        description: '照亮展品的聚光灯'
      },

      // 暖色聚光灯
      warmSpotlight: {
        type: 'spot',
        name: '暖色聚光灯',
        color: 0xffd700,
        intensity: 1.5,
        position: { x: 0, y: 5, z: 3 },
        angle: Math.PI / 6,
        penumbra: 0.5,
        distance: 10,
        description: '暖色调聚光灯'
      },

      // 冷色聚光灯
      coolSpotlight: {
        type: 'spot',
        name: '冷色聚光灯',
        color: 0x87ceeb,
        intensity: 1.5,
        position: { x: 0, y: 5, z: 3 },
        angle: Math.PI / 6,
        penumbra: 0.5,
        distance: 10,
        description: '冷色调聚光灯'
      },

      // 点光源（装饰性）
      pointLight: {
        type: 'point',
        name: '点光源',
        color: 0xffffff,
        intensity: 1,
        position: { x: 0, y: 3, z: 0 },
        distance: 10,
        decay: 2,
        description: '装饰性点光源'
      },

      // 半球光（模拟天空光）
      hemisphere: {
        type: 'hemisphere',
        name: '半球光',
        skyColor: 0xffffff,
        groundColor: 0x444444,
        intensity: 0.5,
        description: '模拟天空光'
      }
    };
  }

  /**
   * 创建灯光
   */
  createLight(key, config = {}) {
    // 检查是否已存在
    if (this.lights.has(key)) {
      console.warn(`Light already exists: ${key}`);
      return this.lights.get(key);
    }

    // 使用预设配置
    const preset = this.presetLights[config.preset] || {};
    const finalConfig = { ...preset, ...config };

    let light;

    switch (finalConfig.type) {
      case 'ambient':
        light = new THREE.AmbientLight(finalConfig.color, finalConfig.intensity);
        break;

      case 'directional':
        light = this.createDirectionalLight(finalConfig);
        break;

      case 'point':
        light = this.createPointLight(finalConfig);
        break;

      case 'spot':
        light = this.createSpotLight(finalConfig);
        break;

      case 'hemisphere':
        light = this.createHemisphereLight(finalConfig);
        break;

      default:
        throw new Error(`Unknown light type: ${finalConfig.type}`);
    }

    // 添加到场景
    this.scene.add(light);

    // 缓存灯光
    this.lights.set(key, light);

    // 添加到灯光组
    const groupName = finalConfig.group || 'default';
    if (!this.lightGroups.has(groupName)) {
      this.lightGroups.set(groupName, []);
    }
    this.lightGroups.get(groupName).push(key);

    console.log(`Light created: ${key} (${finalConfig.type})`);

    return light;
  }

  /**
   * 创建方向光
   */
  createDirectionalLight(config) {
    const { color, intensity, position, castShadow, shadowMapSize = 2048 } = config;

    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(position.x, position.y, position.z);

    if (castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = shadowMapSize;
      light.shadow.mapSize.height = shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 50;
      light.shadow.camera.left = -10;
      light.shadow.camera.right = 10;
      light.shadow.camera.top = 10;
      light.shadow.camera.bottom = -10;
      light.shadow.bias = -0.0001;
    }

    return light;
  }

  /**
   * 创建点光源
   */
  createPointLight(config) {
    const { color, intensity, position, castShadow, shadowMapSize = 2048, distance = 10, decay = 2 } = config;

    const light = new THREE.PointLight(color, intensity, distance, decay);
    light.position.set(position.x, position.y, position.z);

    if (castShadow) {
      light.castShadow = true;
      light.shadow.mapSize.width = shadowMapSize;
      light.shadow.mapSize.height = shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 25;
      light.shadow.bias = -0.0001;
    }

    return light;
  }

  /**
   * 创建聚光灯
   */
  createSpotLight(config) {
    const {
      color,
      intensity,
      position,
      target,
      castShadow,
      shadowMapSize = 2048,
      angle = Math.PI / 6,
      penumbra = 0.3,
      distance = 10,
      decay = 2,
      helper = false
    } = config;

    const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
    light.position.set(position.x, position.y, position.z);

    // 设置目标
    if (target) {
      const targetObject = new THREE.Object3D();
      targetObject.position.set(target.x, target.y, target.z);
      light.add(targetObject);
      light.target = targetObject;
    }

    // 配置阴影
    if (castShadow && this.config.enableShadows) {
      light.castShadow = true;
      light.shadow.mapSize.width = shadowMapSize;
      light.shadow.mapSize.height = shadowMapSize;
      light.shadow.camera.near = 0.5;
      light.shadow.camera.far = 25;
      light.shadow.bias = -0.0001;

      // 优化阴影
      light.shadow.camera.left = -5;
      light.shadow.camera.right = 5;
      light.shadow.camera.top = 5;
      light.shadow.camera.bottom = -5;
    }

    // 添加辅助器
    if (helper || this.config.enableLightHelpers) {
      const spotLightHelper = new THREE.SpotLightHelper(light);
      light.userData.helper = spotLightHelper;
      this.scene.add(spotLightHelper);
    }

    // 更新统计
    this.stats.spotLights++;

    return light;
  }

  /**
   * 创建展品聚光灯（优化的聚光灯）
   */
  createArtworkSpotlight(config) {
    const {
      position,
      target,
      color = 0xffffff,
      intensity = 1.5,
      angle = Math.PI / 8,
      penumbra = 0.5,
      distance = 8
    } = config;

    const spotlight = this.createLight(`artwork_${Date.now()}`, {
      type: 'spot',
      color,
      intensity,
      position,
      target,
      angle,
      penumbra,
      distance,
      castShadow: false, // 展品聚光灯通常不需要阴影
      group: 'artworks'
    });

    return spotlight;
  }

  /**
   * 创建半球光
   */
  createHemisphereLight(config) {
    const { skyColor = 0xffffff, groundColor = 0x444444, intensity = 0.5 } = config;

    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.position.set(0, 10, 0);

    return light;
  }

  /**
   * 获取灯光
   */
  getLight(key) {
    return this.lights.get(key);
  }

  /**
   * 更新灯光
   */
  updateLight(key, config) {
    const light = this.lights.get(key);
    if (!light) {
      throw new Error(`Light not found: ${key}`);
    }

    // 更新属性
    if (config.color !== undefined && light.color) {
      light.color.set(config.color);
    }

    if (config.intensity !== undefined) {
      light.intensity = config.intensity;
    }

    if (config.position && light.position) {
      light.position.set(config.position.x, config.position.y, config.position.z);
    }

    // 更新聚光灯参数
    if (config.angle !== undefined && light.angle !== undefined) {
      light.angle = config.angle;
    }

    if (config.penumbra !== undefined && light.penumbra !== undefined) {
      light.penumbra = config.penumbra;
    }

    if (config.distance !== undefined && light.distance !== undefined) {
      light.distance = config.distance;
    }

    if (config.target && light.target) {
      light.target.position.set(config.target.x, config.target.y, config.target.z);
    }
  }

  /**
   * 动画灯光强度
   */
  animateLightIntensity(key, targetIntensity, duration = 1) {
    const light = this.lights.get(key);
    if (!light) {
      console.warn(`Light not found: ${key}`);
      return;
    }

    gsap.to(light, {
      intensity: targetIntensity,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * 动画灯光颜色
   */
  animateLightColor(key, targetColor, duration = 1) {
    const light = this.lights.get(key);
    if (!light || !light.color) {
      console.warn(`Light not found or has no color: ${key}`);
      return;
    }

    const color = new THREE.Color(targetColor);
    gsap.to(light.color, {
      r: color.r,
      g: color.g,
      b: color.b,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * 动画灯光位置
   */
  animateLightPosition(key, targetPosition, duration = 1) {
    const light = this.lights.get(key);
    if (!light || !light.position) {
      console.warn(`Light not found or has no position: ${key}`);
      return;
    }

    gsap.to(light.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration,
      ease: 'power2.inOut'
    });
  }

  /**
   * 设置灯光组强度
   */
  setGroupIntensity(groupName, intensity) {
    const group = this.lightGroups.get(groupName);
    if (!group) {
      console.warn(`Light group not found: ${groupName}`);
      return;
    }

    group.forEach((key) => {
      this.updateLight(key, { intensity });
    });
  }

  /**
   * 动画灯光组强度
   */
  animateGroupIntensity(groupName, targetIntensity, duration = 1) {
    const group = this.lightGroups.get(groupName);
    if (!group) {
      console.warn(`Light group not found: ${groupName}`);
      return;
    }

    group.forEach((key) => {
      this.animateLightIntensity(key, targetIntensity, duration);
    });
  }

  /**
   * 移除灯光
   */
  removeLight(key) {
    const light = this.lights.get(key);
    if (!light) {
      console.warn(`Light not found: ${key}`);
      return;
    }

    // 从场景移除
    this.scene.remove(light);

    // 从灯光组移除
    this.lightGroups.forEach((group, groupName) => {
      const index = group.indexOf(key);
      if (index > -1) {
        group.splice(index, 1);
      }
    });

    // 从缓存移除
    this.lights.delete(key);

    console.log(`Light removed: ${key}`);
  }

  /**
   * 移除灯光组
   */
  removeGroup(groupName) {
    const group = this.lightGroups.get(groupName);
    if (!group) {
      console.warn(`Light group not found: ${groupName}`);
      return;
    }

    // 移除组内所有灯光
    [...group].forEach((key) => {
      this.removeLight(key);
    });

    // 移除组
    this.lightGroups.delete(groupName);

    console.log(`Light group removed: ${groupName}`);
  }

  /**
   * 清理所有灯光
   */
  clear() {
    // 移除所有灯光
    this.lights.forEach((light, key) => {
      this.scene.remove(light);
    });

    this.lights.clear();
    this.lightGroups.clear();

    console.log('LightManager cleared');
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalLights: this.lights.size,
      groups: this.lightGroups.size,
      groupDetails: Object.fromEntries(
        Array.from(this.lightGroups.entries()).map(([name, keys]) => [name, keys.length])
      )
    };
  }

  /**
   * 优化灯光性能
   */
  optimize() {
    // 限制阴影贴图大小
    let shadowLightCount = 0;
    this.lights.forEach((light, key) => {
      if (light.castShadow && light.shadow) {
        shadowLightCount++;
        if (shadowLightCount > this.config.maxShadowLights) {
          // 超过限制，禁用阴影
          light.castShadow = false;
          console.log(`Disabled shadow for light: ${key} (exceeded max shadow lights)`);
        } else {
          // 优化阴影贴图大小
          light.shadow.mapSize.width = Math.min(light.shadow.mapSize.width, 1024);
          light.shadow.mapSize.height = Math.min(light.shadow.mapSize.height, 1024);
        }
      }
    });

    // 降低灯光强度
    this.lights.forEach((light) => {
      if (light.intensity) {
        light.intensity = Math.min(light.intensity, 1.5);
      }
    });

    // 移除不必要的灯光辅助器
    if (!this.config.enableLightHelpers) {
      this.lights.forEach((light) => {
        if (light.userData.helper) {
          this.scene.remove(light.userData.helper);
          delete light.userData.helper;
        }
      });
    }

    console.log('LightManager optimized');
  }

  /**
   * 优化阴影性能
   */
  optimizeShadows() {
    const shadowLights = [];

    // 收集所有投射阴影的灯光
    this.lights.forEach((light) => {
      if (light.castShadow) {
        shadowLights.push(light);
      }
    });

    // 如果超过限制，保留最重要的灯光
    if (shadowLights.length > this.config.maxShadowLights) {
      console.warn(`Too many shadow lights (${shadowLights.length}), disabling shadows for excess lights`);

      // 保留前 N 个灯光的阴影
      shadowLights.slice(this.config.maxShadowLights).forEach((light) => {
        light.castShadow = false;
      });
    }

    // 优化阴影贴图大小
    shadowLights.slice(0, this.config.maxShadowLights).forEach((light, index) => {
      // 主要灯光使用高质量，次要灯光使用低质量
      const quality = index === 0 ? 2048 : 1024;
      light.shadow.mapSize.width = quality;
      light.shadow.mapSize.height = quality;
    });

    console.log(
      `Shadow optimization completed. Active shadow lights: ${Math.min(shadowLights.length, this.config.maxShadowLights)}`
    );
  }

  /**
   * 限制点光源数量
   */
  limitPointLights() {
    let pointLightCount = 0;
    this.lights.forEach((light, key) => {
      if (light instanceof THREE.PointLight) {
        pointLightCount++;
        if (pointLightCount > this.config.maxPointLights) {
          this.removeLight(key);
          pointLightCount--;
          console.log(`Removed point light: ${key} (exceeded max point lights)`);
        }
      }
    });
  }

  /**
   * 限制聚光灯数量
   */
  limitSpotLights() {
    let spotLightCount = 0;
    this.lights.forEach((light, key) => {
      if (light instanceof THREE.SpotLight) {
        spotLightCount++;
        if (spotLightCount > this.config.maxSpotLights) {
          this.removeLight(key);
          spotLightCount--;
          console.log(`Removed spot light: ${key} (exceeded max spot lights)`);
        }
      }
    });
  }

  /**
   * 设置场景基调
   */
  setSceneMood(mood) {
    switch (mood) {
      case 'warm':
        // 温暖氛围
        this.updateLight('ambient', { color: 0xffd700, intensity: 0.5 });
        this.updateLight('mainLight', { color: 0xffa500, intensity: 0.8 });
        break;

      case 'cool':
        // 清冷氛围
        this.updateLight('ambient', { color: 0x87ceeb, intensity: 0.4 });
        this.updateLight('mainLight', { color: 0xadd8e6, intensity: 0.8 });
        break;

      case 'dramatic':
        // 戏剧性氛围
        this.updateLight('ambient', { color: 0x000000, intensity: 0.1 });
        this.updateLight('mainLight', { color: 0xffffff, intensity: 1.2 });
        break;

      case 'soft':
        // 柔和氛围
        this.updateLight('ambient', { color: 0xffffff, intensity: 0.6 });
        this.updateLight('mainLight', { color: 0xffffff, intensity: 0.6 });
        break;

      default:
        // 默认氛围
        this.updateLight('ambient', { color: 0xffffff, intensity: 0.4 });
        this.updateLight('mainLight', { color: 0xffffff, intensity: 0.8 });
    }

    console.log(`Scene mood set to: ${mood}`);
  }

  /**
   * 模拟昼夜变化
   */
  animateDayNightCycle(duration = 10) {
    // 动画主光源位置
    const mainLight = this.getLight('mainLight');
    if (mainLight) {
      gsap.to(mainLight.position, {
        x: 10,
        y: 15,
        z: 5,
        duration: duration * 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(mainLight.position, {
            x: -10,
            y: 15,
            z: 5,
            duration: duration * 0.7,
            ease: 'power2.inOut'
          });
        }
      });
    }

    // 动画环境光强度
    const ambientLight = this.getLight('ambient');
    if (ambientLight) {
      gsap.to(ambientLight, {
        intensity: 0.8,
        duration: duration * 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(ambientLight, {
            intensity: 0.3,
            duration: duration * 0.7,
            ease: 'power2.inOut'
          });
        }
      });
    }
  }

  /**
   * 灯光闪烁效果
   */
  flickerLight(key, options = {}) {
    const { minIntensity = 0.5, maxIntensity = 1.5, duration = 0.1, count = 5 } = options;

    const light = this.getLight(key);
    if (!light) return;

    const timeline = gsap.timeline({
      repeat: count - 1,
      yoyo: true
    });

    timeline.to(light, {
      intensity: maxIntensity,
      duration: duration,
      ease: 'power1.inOut'
    });

    timeline.to(light, {
      intensity: minIntensity,
      duration: duration,
      ease: 'power1.inOut'
    });
  }

  /**
   * 灯光呼吸效果
   */
  breatheLight(key, options = {}) {
    const { minIntensity = 0.8, maxIntensity = 1.2, duration = 2, repeat = -1 } = options;

    const light = this.getLight(key);
    if (!light) return;

    gsap.to(light, {
      intensity: maxIntensity,
      duration: duration,
      ease: 'sine.inOut',
      repeat: repeat,
      yoyo: true
    });
  }

  /**
   * 获取详细统计信息
   */
  getDetailedStats() {
    return {
      total: this.lights.size,
      byType: { ...this.stats },
      groups: this.lightGroups.size,
      groupDetails: Object.fromEntries(
        Array.from(this.lightGroups.entries()).map(([name, keys]) => [name, keys.length])
      ),
      shadowsEnabled: this.config.enableShadows,
      maxShadowLights: this.config.maxShadowLights,
      currentShadowLights: Array.from(this.lights.values()).filter((light) => light.castShadow).length
    };
  }

  /**
   * 导出灯光配置
   */
  exportConfig() {
    const config = [];

    this.lights.forEach((light, key) => {
      const lightConfig = {
        key,
        type: light.type,
        color: light.color ? '#' + light.color.getHexString() : null,
        intensity: light.intensity,
        position: light.position ? { x: light.position.x, y: light.position.y, z: light.position.z } : null,
        castShadow: light.castShadow
      };

      // 添加特定类型的参数
      if (light instanceof THREE.SpotLight) {
        lightConfig.angle = light.angle;
        lightConfig.penumbra = light.penumbra;
        lightConfig.distance = light.distance;
      } else if (light instanceof THREE.PointLight) {
        lightConfig.distance = light.distance;
        lightConfig.decay = light.decay;
      }

      config.push(lightConfig);
    });

    return config;
  }

  /**
   * 导入灯光配置
   */
  importConfig(config) {
    config.forEach((lightConfig) => {
      this.createLight(lightConfig.key, lightConfig);
    });

    console.log(`Imported ${config.length} lights`);
  }
}
