/**
 * 顶棚类
 *
 * 职责:
 * - 创建顶棚几何体和材质
 * - 支持顶棚灯光安装点
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';

export class Ceiling {
  constructor(config = {}) {
    this.config = {
      width: 16,
      length: 80,
      height: 12,
      color: 0x4a3728,
      texture: null,
      ...config
    };

    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.texture = null;
    this.lightMountingPoints = [];
  }

  /**
   * 创建顶棚
   */
  async create(scene) {
    try {
      // 创建几何体
      this.geometry = new THREE.PlaneGeometry(this.config.width, this.config.length);

      // 创建材质
      let material;

      if (this.config.texture) {
        // 加载纹理
        const textureLoader = new THREE.TextureLoader();
        try {
          this.texture = await new Promise((resolve, reject) => {
            textureLoader.load(this.config.texture, resolve, undefined, reject);
          });

          // 设置纹理重复
          this.texture.wrapS = THREE.RepeatWrapping;
          this.texture.wrapT = THREE.RepeatWrapping;
          this.texture.repeat.set(this.config.width / 2, this.config.length / 2);

          material = new THREE.MeshStandardMaterial({
            map: this.texture,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
        } catch (error) {
          console.warn(`Failed to load ceiling texture: ${this.config.texture}`, error);
          material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
        }
      } else {
        material = new THREE.MeshStandardMaterial({
          color: this.config.color,
          roughness: 0.7,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
      }

      this.material = material;

      // 创建网格
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.rotation.x = Math.PI / 2;
      this.mesh.position.y = this.config.height;
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;

      // 添加到场景
      scene.add(this.mesh);

      console.log('Ceiling created');
    } catch (error) {
      console.error('Failed to create Ceiling:', error);
      throw error;
    }
  }

  /**
   * 添加灯光安装点
   */
  addLightMountingPoint(x, z) {
    this.lightMountingPoints.push({ x, z });
  }

  /**
   * 获取灯光安装点
   */
  getLightMountingPoints() {
    return [...this.lightMountingPoints];
  }

  /**
   * 销毁顶棚
   */
  destroy() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }

    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }

    if (this.texture) {
      this.texture.dispose();
    }

    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.texture = null;
    this.lightMountingPoints = [];

    console.log('Ceiling destroyed');
  }
}
