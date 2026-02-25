/**
 * 材质管理器
 *
 * 职责:
 * - 管理所有材质的创建、复用和销毁
 * - 提供材质缓存机制
 * - 支持材质加载队列
 * - 提供预设材质
 * - 材质优化和压缩
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';

export class MaterialManager {
  constructor(options = {}) {
    this.materials = new Map(); // 材质缓存
    this.textures = new Map(); // 纹理缓存
    this.loadingPromises = new Map(); // 加载队列

    // 材质优化配置
    this.config = {
      enableCompression: options.enableCompression !== false,
      maxTextureSize: options.maxTextureSize || 2048,
      enableMipmaps: options.enableMipmaps !== false,
      anisotropy: options.anisotropy || 4
    };

    // 预设材质定义（来自材质光影规范.md）
    this.presetMaterials = {
      // 墙面材质
      wall: {
        name: '墙面',
        color: 0xf5f5f5, // 米白色
        roughness: 0.9,
        metalness: 0.0,
        description: '米白色墙面，柔和反光'
      },
      wallDark: {
        name: '深色墙面',
        color: 0x8b7355, // 棕色
        roughness: 0.8,
        metalness: 0.1,
        description: '深色墙面，温暖氛围'
      },

      // 地面材质
      floor: {
        name: '地面',
        color: 0x3d2817, // 深棕色
        roughness: 0.7,
        metalness: 0.2,
        description: '石材地面，有光泽'
      },
      floorWood: {
        name: '木地板',
        color: 0x5c4033, // 木质色
        roughness: 0.8,
        metalness: 0.1,
        description: '木地板，温暖自然'
      },

      // 顶棚材质
      ceiling: {
        name: '顶棚',
        color: 0xffffff, // 白色
        roughness: 0.6,
        metalness: 0.1,
        description: '白色顶棚，光照响应'
      },

      // 画框材质
      frame: {
        name: '画框',
        color: 0x8b7355, // 棕色
        roughness: 0.6,
        metalness: 0.3,
        description: '木质画框，金色装饰'
      },
      frameGold: {
        name: '金色画框',
        color: 0xd4af37, // 金色
        roughness: 0.3,
        metalness: 0.8,
        description: '金色画框，高光效果'
      },

      // 画布材质
      canvas: {
        name: '画布',
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.0,
        description: '画布材质，不反光'
      },

      // 展示面板材质
      panel: {
        name: '展示面板',
        color: 0xfaf0e6, // 亚麻色
        roughness: 0.8,
        metalness: 0.1,
        description: '展示面板，清晰易读'
      },

      // 发光材质
      emissive: {
        name: '发光',
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 1.0,
        roughness: 0.5,
        metalness: 0.5,
        description: '自发光材质'
      },

      // 玻璃材质
      glass: {
        name: '玻璃',
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.0,
        metalness: 0.0,
        description: '透明玻璃材质'
      }
    };
  }

  /**
   * 获取或创建材质
   */
  async getMaterial(key, config = {}) {
    // 检查缓存
    if (this.materials.has(key)) {
      return this.materials.get(key);
    }

    // 使用预设材质
    if (this.presetMaterials[key]) {
      const preset = { ...this.presetMaterials[key], ...config };
      const material = this.createStandardMaterial(preset);
      this.materials.set(key, material);
      return material;
    }

    // 创建自定义材质
    const material = this.createStandardMaterial(config);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建标准材质
   */
  createStandardMaterial(config) {
    const {
      color = 0xffffff,
      roughness = 0.5,
      metalness = 0.5,
      map = null,
      normalMap = null,
      roughnessMap = null,
      metalnessMap = null,
      emissive = 0x000000,
      emissiveIntensity = 1,
      side = THREE.FrontSide,
      transparent = false,
      opacity = 1.0
    } = config;

    const materialConfig = {
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity,
      side,
      transparent,
      opacity
    };

    if (map) materialConfig.map = map;
    if (normalMap) materialConfig.normalMap = normalMap;
    if (roughnessMap) materialConfig.roughnessMap = roughnessMap;
    if (metalnessMap) materialConfig.metalnessMap = metalnessMap;

    return new THREE.MeshStandardMaterial(materialConfig);
  }

  /**
   * 创建墙面材质
   */
  async createWallMaterial(config = {}) {
    const key = config.key || 'wall';
    const preset = this.presetMaterials.wall;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness,
      side: THREE.DoubleSide
    };

    // 如果有纹理，加载纹理
    if (config.textureUrl) {
      return this.createTexturedMaterial(key, config.textureUrl, materialConfig);
    }

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建地面材质
   */
  async createFloorMaterial(config = {}) {
    const key = config.key || 'floor';
    const preset = this.presetMaterials.floor;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness,
      side: THREE.DoubleSide
    };

    // 如果有纹理，加载纹理
    if (config.textureUrl) {
      return this.createTexturedMaterial(key, config.textureUrl, materialConfig);
    }

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建顶棚材质
   */
  async createCeilingMaterial(config = {}) {
    const key = config.key || 'ceiling';
    const preset = this.presetMaterials.ceiling;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness,
      side: THREE.DoubleSide
    };

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建画框材质
   */
  async createFrameMaterial(config = {}) {
    const key = config.key || 'frame';
    const preset = this.presetMaterials.frame;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness
    };

    // 如果有纹理，加载纹理
    if (config.textureUrl) {
      return this.createTexturedMaterial(key, config.textureUrl, materialConfig);
    }

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建金色画框材质
   */
  async createGoldFrameMaterial(config = {}) {
    const key = config.key || 'frameGold';
    const preset = this.presetMaterials.frameGold;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness
    };

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建画布材质
   */
  async createCanvasMaterial(config = {}) {
    const key = config.key || 'canvas';
    const preset = this.presetMaterials.canvas;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness
    };

    // 如果有纹理（画作图片），加载纹理
    if (config.textureUrl) {
      return this.createTexturedMaterial(key, config.textureUrl, materialConfig);
    }

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 创建展示面板材质
   */
  async createPanelMaterial(config = {}) {
    const key = config.key || 'panel';
    const preset = this.presetMaterials.panel;

    const materialConfig = {
      color: config.color || preset.color,
      roughness: config.roughness || preset.roughness,
      metalness: config.metalness || preset.metalness,
      side: THREE.DoubleSide
    };

    // 创建材质
    const material = this.createStandardMaterial(materialConfig);
    this.materials.set(key, material);
    return material;
  }

  /**
   * 加载纹理
   */
  async loadTexture(url, config = {}) {
    // 检查缓存
    if (this.textures.has(url)) {
      return this.textures.get(url);
    }

    // 检查加载队列
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // 开始加载
    const loadingPromise = new Promise((resolve, reject) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        url,
        (texture) => {
          // 应用配置
          const {
            wrapS = THREE.RepeatWrapping,
            wrapT = THREE.RepeatWrapping,
            repeatX = 1,
            repeatY = 1,
            flipY = true,
            colorSpace = THREE.SRGBColorSpace
          } = config;

          // 设置纹理属性
          texture.wrapS = wrapS;
          texture.wrapT = wrapT;
          texture.repeat.set(repeatX, repeatY);
          texture.flipY = flipY;
          texture.colorSpace = colorSpace;

          // 应用压缩和优化
          if (this.config.enableCompression) {
            this.optimizeTexture(texture);
          }

          // 缓存纹理
          this.textures.set(url, texture);

          // 从加载队列移除
          this.loadingPromises.delete(url);

          resolve(texture);
        },
        undefined,
        (error) => {
          // 从加载队列移除
          this.loadingPromises.delete(url);

          console.error(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });

    // 添加到加载队列
    this.loadingPromises.set(url, loadingPromise);

    return loadingPromise;
  }

  /**
   * 优化纹理
   */
  optimizeTexture(texture) {
    // 设置最大纹理尺寸
    const maxSize = this.config.maxTextureSize;
    if (texture.image && texture.image.width > maxSize) {
      // 创建临时 canvas 进行缩放
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 计算缩放比例
      const scale = maxSize / texture.image.width;
      canvas.width = maxSize;
      canvas.height = texture.image.height * scale;

      // 绘制缩放后的图像
      ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

      // 更新纹理
      texture.image = canvas;
      texture.needsUpdate = true;
    }

    // 设置各向异性过滤
    texture.anisotropy = this.config.anisotropy;

    // 启用/禁用 mipmaps
    texture.generateMipmaps = this.config.enableMipmaps;

    // 设置过滤方式
    texture.minFilter = this.config.enableMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    console.log('Texture optimized:', {
      size: `${texture.image.width}x${texture.image.height}`,
      anisotropy: texture.anisotropy,
      mipmaps: texture.generateMipmaps
    });
  }

  /**
   * 压缩材质
   */
  compressMaterial(material) {
    if (!material) return;

    // 减少材质属性
    if (material.map) {
      material.map.anisotropy = Math.min(material.map.anisotropy, 4);
    }

    // 如果材质支持，减少精度
    if (material.userData.precision) {
      material.userData.precision = 'lowp';
    }

    console.log('Material compressed');
  }

  /**
   * 创建带纹理的材质
   */
  async createTexturedMaterial(key, textureUrl, config = {}) {
    // 检查缓存
    if (this.materials.has(key)) {
      return this.materials.get(key);
    }

    try {
      // 加载纹理
      const texture = await this.loadTexture(textureUrl, config);

      // 创建材质
      const material = this.createStandardMaterial({
        ...config,
        map: texture
      });

      // 缓存材质
      this.materials.set(key, material);

      return material;
    } catch (error) {
      console.error(`Failed to create textured material: ${key}`, error);

      // 返回默认材质
      const defaultMaterial = this.createStandardMaterial(config);
      this.materials.set(key, defaultMaterial);
      return defaultMaterial;
    }
  }

  /**
   * 创建发光材质
   */
  createEmissiveMaterial(config = {}) {
    const { color = 0xffffff, emissive = 0xffffff, emissiveIntensity = 1, roughness = 0.5, metalness = 0.5 } = config;

    return new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness,
      metalness
    });
  }

  /**
   * 创建透明材质
   */
  createTransparentMaterial(config = {}) {
    const { color = 0xffffff, opacity = 0.5, transparent = true, side = THREE.DoubleSide } = config;

    return new THREE.MeshStandardMaterial({
      color,
      opacity,
      transparent,
      side
    });
  }

  /**
   * 克隆材质
   */
  cloneMaterial(key, newKey) {
    const original = this.materials.get(key);
    if (!original) {
      throw new Error(`Material not found: ${key}`);
    }

    const cloned = original.clone();
    this.materials.set(newKey, cloned);
    return cloned;
  }

  /**
   * 获取材质（直接获取，不创建）
   */
  fetchMaterial(key) {
    return this.materials.get(key);
  }

  /**
   * 获取纹理
   */
  getTexture(url) {
    return this.textures.get(url);
  }

  /**
   * 移除材质
   */
  removeMaterial(key) {
    const material = this.materials.get(key);
    if (material) {
      material.dispose();
      this.materials.delete(key);
    }
  }

  /**
   * 移除纹理
   */
  removeTexture(url) {
    const texture = this.textures.get(url);
    if (texture) {
      texture.dispose();
      this.textures.delete(url);
    }
  }

  /**
   * 清理所有材质
   */
  clear() {
    // 释放所有材质
    this.materials.forEach((material) => {
      material.dispose();
    });
    this.materials.clear();

    // 释放所有纹理
    this.textures.forEach((texture) => {
      texture.dispose();
    });
    this.textures.clear();

    // 清空加载队列
    this.loadingPromises.clear();

    console.log('MaterialManager cleared');
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      materials: this.materials.size,
      textures: this.textures.size,
      loading: this.loadingPromises.size
    };
  }

  /**
   * 获取预设材质列表
   */
  getPresetMaterials() {
    return Object.keys(this.presetMaterials);
  }

  /**
   * 获取预设材质信息
   */
  getPresetMaterialInfo(key) {
    return this.presetMaterials[key] || null;
  }

  /**
   * 批量创建材质
   */
  async createMaterialsBatch(materialConfigs) {
    const results = {};

    for (const config of materialConfigs) {
      try {
        const material = await this.getMaterial(config.key, config);
        results[config.key] = { success: true, material };
      } catch (error) {
        results[config.key] = { success: false, error };
      }
    }

    return results;
  }

  /**
   * 按需释放材质
   */
  releaseMaterialIfUnused(key, usedByObjects = []) {
    const material = this.materials.get(key);
    if (!material) return false;

    // 检查是否有对象正在使用这个材质
    if (usedByObjects.length > 0) {
      return false; // 材质正在使用中
    }

    // 释放材质
    this.removeMaterial(key);
    return true;
  }

  /**
   * 更新材质参数
   */
  updateMaterial(key, params) {
    const material = this.materials.get(key);
    if (!material) {
      console.warn(`Material not found: ${key}`);
      return false;
    }

    // 更新材质参数
    Object.assign(material, params);
    material.needsUpdate = true;
    return true;
  }

  /**
   * 批量更新材质
   */
  updateMaterialsBatch(updates) {
    const results = {};

    for (const update of updates) {
      results[update.key] = this.updateMaterial(update.key, update.params);
    }

    return results;
  }

  /**
   * 预加载材质
   */
  async preloadMaterials(materialKeys) {
    const results = {};

    for (const key of materialKeys) {
      if (this.presetMaterials[key]) {
        try {
          const material = await this.getMaterial(key);
          results[key] = { success: true, material };
        } catch (error) {
          results[key] = { success: false, error };
        }
      } else {
        results[key] = { success: false, error: 'Preset not found' };
      }
    }

    return results;
  }

  /**
   * 导出材质配置
   */
  exportMaterialConfig(key) {
    const material = this.materials.get(key);
    if (!material) return null;

    return {
      key,
      type: material.type,
      color: material.color ? '#' + material.color.getHexString() : null,
      roughness: material.roughness,
      metalness: material.metalness,
      emissive: material.emissive ? '#' + material.emissive.getHexString() : null,
      emissiveIntensity: material.emissiveIntensity,
      transparent: material.transparent,
      opacity: material.opacity,
      side: material.side
    };
  }

  /**
   * 导入材质配置
   */
  async importMaterialConfig(config) {
    const { key, type, ...params } = config;

    if (this.materials.has(key)) {
      console.warn(`Material already exists: ${key}`);
      return this.materials.get(key);
    }

    let material;

    switch (type) {
      case 'MeshStandardMaterial':
        material = this.createStandardMaterial(params);
        break;
      default:
        material = this.createStandardMaterial(params);
    }

    this.materials.set(key, material);
    return material;
  }
}
