/**
 * 墙面类
 *
 * 职责:
 * - 创建墙面几何体和材质
 * - 支持墙面纹理加载
 * - 支持墙面上的画作挂载点
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';

export class Wall {
  constructor(config = {}) {
    this.config = {
      width: 10,
      height: 4,
      thickness: 0.2,
      color: 0x8b7355,
      texture: null,
      position: { x: 0, y: 2, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      ...config
    };

    this.mesh = null;
    this.material = null;
    this.geometry = null;
    this.texture = null;
    this.mountingPoints = [];
  }

  /**
   * 创建墙面
   */
  async create(scene) {
    try {
      // 创建几何体
      this.geometry = new THREE.PlaneGeometry(this.config.width, this.config.height);

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
          this.texture.repeat.set(this.config.width / 2, this.config.height / 2);

          material = new THREE.MeshStandardMaterial({
            map: this.texture,
            roughness: 0.8,
            metalness: 0.1
          });
        } catch (error) {
          console.warn(`Failed to load wall texture: ${this.config.texture}`, error);
          material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.8,
            metalness: 0.1
          });
        }
      } else {
        material = new THREE.MeshStandardMaterial({
          color: this.config.color,
          roughness: 0.8,
          metalness: 0.1
        });
      }

      this.material = material;

      // 创建网格
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.position.set(this.config.position.x, this.config.position.y, this.config.position.z);
      this.mesh.rotation.set(this.config.rotation.x, this.config.rotation.y, this.config.rotation.z);
      this.mesh.receiveShadow = true;
      this.mesh.castShadow = true;

      // 添加到场景
      scene.add(this.mesh);

      console.log('Wall created');
    } catch (error) {
      console.error('Failed to create Wall:', error);
      throw error;
    }
  }

  /**
   * 添加挂载点
   */
  addMountingPoint(x, y, width, height) {
    this.mountingPoints.push({
      x,
      y,
      width,
      height
    });
  }

  /**
   * 获取挂载点
   */
  getMountingPoints() {
    return [...this.mountingPoints];
  }

  /**
   * 销毁墙面
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
    this.mountingPoints = [];

    console.log('Wall destroyed');
  }
}
