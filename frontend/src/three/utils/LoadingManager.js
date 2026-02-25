/**
 * 加载管理器
 *
 * 职责:
 * - 管理资源加载队列
 * - 提供加载进度显示
 * - 处理加载错误
 * - 支持资源预加载
 * - 支持按优先级加载
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';

export class LoadingManager {
  constructor() {
    // 加载队列
    this.loadingQueue = [];
    this.isLoading = false;

    // 加载状态
    this.state = {
      totalItems: 0,
      loadedItems: 0,
      failedItems: 0,
      progress: 0
    };

    // 资源缓存
    this.cache = new Map();

    // 错误处理
    this.errors = [];

    // 进度回调
    this.onProgress = null;
    this.onError = null;
    this.onComplete = null;

    // Three.js 加载器
    this.loaders = {
      texture: new THREE.TextureLoader(),
      json: new THREE.FileLoader(),
      gltf: new THREE.GLTFLoader()
    };
  }

  /**
   * 设置进度回调
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  /**
   * 设置错误回调
   */
  setErrorCallback(callback) {
    this.onError = callback;
  }

  /**
   * 设置完成回调
   */
  setCompleteCallback(callback) {
    this.onComplete = callback;
  }

  /**
   * 添加加载任务
   */
  addLoadingTask(task) {
    const taskWithDefaults = {
      id: task.id || `task_${Date.now()}`,
      type: task.type, // 'texture', 'json', 'gltf', 'custom'
      url: task.url,
      loader: task.loader || this.getLoaderByType(task.type),
      priority: task.priority || 0, // 0 = low, 1 = medium, 2 = high
      onComplete: task.onComplete || null,
      onError: task.onError || null,
      ...task
    };

    this.loadingQueue.push(taskWithDefaults);
    this.state.totalItems++;
  }

  /**
   * 根据类型获取加载器
   */
  getLoaderByType(type) {
    switch (type) {
      case 'texture':
        return this.loaders.texture;
      case 'json':
        return this.loaders.json;
      case 'gltf':
        return this.loaders.gltf;
      default:
        return null;
    }
  }

  /**
   * 开始加载
   */
  async startLoading() {
    if (this.isLoading) {
      console.warn('Loading is already in progress');
      return;
    }

    if (this.loadingQueue.length === 0) {
      console.warn('No items to load');
      return;
    }

    this.isLoading = true;
    this.state.loadedItems = 0;
    this.state.failedItems = 0;
    this.state.progress = 0;

    console.log(`Starting to load ${this.loadingQueue.length} items...`);

    try {
      // 按优先级排序
      this.loadingQueue.sort((a, b) => b.priority - a.priority);

      // 依次加载所有任务
      for (const task of this.loadingQueue) {
        await this.loadTask(task);
      }

      console.log('Loading completed successfully');

      // 触发完成回调
      if (this.onComplete) {
        this.onComplete({
          total: this.state.totalItems,
          loaded: this.state.loadedItems,
          failed: this.state.failedItems
        });
      }
    } catch (error) {
      console.error('Loading failed:', error);

      // 触发错误回调
      if (this.onError) {
        this.onError(error);
      }
    } finally {
      this.isLoading = false;
      this.loadingQueue = [];
    }
  }

  /**
   * 加载单个任务
   */
  async loadTask(task) {
    const { id, type, url, loader, onComplete, onError } = task;

    try {
      console.log(`Loading ${id} from ${url}...`);

      // 检查缓存
      if (this.cache.has(url)) {
        console.log(`Resource ${id} loaded from cache`);
        const cachedResource = this.cache.get(url);

        if (onComplete) {
          onComplete(cachedResource);
        }

        this.state.loadedItems++;
        this.updateProgress();
        return cachedResource;
      }

      // 加载资源
      const resource = await new Promise((resolve, reject) => {
        loader.load(
          url,
          (loaded) => {
            console.log(`Successfully loaded ${id}`);
            resolve(loaded);
          },
          (progress) => {
            // 更新单个任务的进度
            if (progress && progress.total > 0) {
              const taskProgress = progress.loaded / progress.total;
              console.log(`Loading ${id}: ${(taskProgress * 100).toFixed(2)}%`);
            }
          },
          (error) => {
            console.error(`Failed to load ${id}:`, error);
            reject(error);
          }
        );
      });

      // 缓存资源
      this.cache.set(url, resource);

      // 触发任务完成回调
      if (onComplete) {
        onComplete(resource);
      }

      this.state.loadedItems++;
      this.updateProgress();

      return resource;
    } catch (error) {
      console.error(`Error loading task ${id}:`, error);

      // 记录错误
      this.errors.push({ id, error });

      // 触发任务错误回调
      if (onError) {
        onError(error);
      }

      this.state.failedItems++;
      this.updateProgress();

      throw error;
    }
  }

  /**
   * 更新加载进度
   */
  updateProgress() {
    const total = this.state.totalItems;
    const completed = this.state.loadedItems + this.state.failedItems;

    if (total > 0) {
      this.state.progress = (completed / total) * 100;
    }

    // 触发进度回调
    if (this.onProgress) {
      this.onProgress({
        total: total,
        loaded: this.state.loadedItems,
        failed: this.state.failedItems,
        progress: this.state.progress
      });
    }
  }

  /**
   * 加载纹理
   */
  async loadTexture(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { onComplete, onError, id = `texture_${Date.now()}` } = options;

      this.addLoadingTask({
        id,
        type: 'texture',
        url,
        onComplete: (resource) => {
          if (onComplete) onComplete(resource);
          resolve(resource);
        },
        onError: (error) => {
          if (onError) onError(error);
          reject(error);
        }
      });
    });
  }

  /**
   * 加载 JSON 文件
   */
  async loadJSON(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { onComplete, onError, id = `json_${Date.now()}` } = options;

      this.addLoadingTask({
        id,
        type: 'json',
        url,
        onComplete: (resource) => {
          const parsed = JSON.parse(resource);
          if (onComplete) onComplete(parsed);
          resolve(parsed);
        },
        onError: (error) => {
          if (onError) onError(error);
          reject(error);
        }
      });
    });
  }

  /**
   * 加载 GLTF 模型
   */
  async loadGLTF(url, options = {}) {
    return new Promise((resolve, reject) => {
      const { onComplete, onError, id = `gltf_${Date.now()}` } = options;

      this.addLoadingTask({
        id,
        type: 'gltf',
        url,
        onComplete: (resource) => {
          if (onComplete) onComplete(resource);
          resolve(resource);
        },
        onError: (error) => {
          if (onError) onError(error);
          reject(error);
        }
      });
    });
  }

  /**
   * 获取缓存的资源
   */
  getCachedResource(url) {
    return this.cache.get(url);
  }

  /**
   * 清空缓存
   */
  clearCache() {
    // 释放所有缓存的资源
    this.cache.forEach((resource) => {
      if (resource instanceof THREE.Texture) {
        resource.dispose();
      }
    });

    this.cache.clear();
    console.log('Loading cache cleared');
  }

  /**
   * 获取加载状态
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 获取错误列表
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * 取消加载
   */
  cancelLoading() {
    if (this.isLoading) {
      console.log('Cancelling loading...');
      this.isLoading = false;
      this.loadingQueue = [];
    }
  }

  /**
   * 重置加载管理器
   */
  reset() {
    this.cancelLoading();
    this.state = {
      totalItems: 0,
      loadedItems: 0,
      failedItems: 0,
      progress: 0
    };
    this.errors = [];
    this.onProgress = null;
    this.onError = null;
    this.onComplete = null;
  }
}
