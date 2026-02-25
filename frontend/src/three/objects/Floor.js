/**
 * 地面类
 *
 * 职责:
 * - 创建地面几何体和材质
 * - 支持地面纹理和网格辅助线
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';

export class Floor {
  constructor(config = {}) {
    this.config = {
      width: 16,
      length: 80,
      color: 0x3d2817,
      texture: null,
      showGrid: true,
      ...config
    };

    this.mesh = null;
    this.gridHelper = null;
    this.material = null;
    this.geometry = null;
    this.texture = null;
  }

  /**
   * 创建地面
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
            roughness: 0.8,
            metalness: 0.1
          });
        } catch (error) {
          console.warn(`Failed to load floor texture: ${this.config.texture}`, error);
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
      this.mesh.rotation.x = -Math.PI / 2;
      this.mesh.position.y = 0;
      this.mesh.receiveShadow = true;

      // 添加到场景
      scene.add(this.mesh);

      // 添加网格辅助线
      if (this.config.showGrid) {
        this.gridHelper = new THREE.GridHelper(this.config.width, this.config.width, 0x5c4033, 0x3d2817);
        this.gridHelper.position.y = 0.01;
        scene.add(this.gridHelper);
      }

      console.log('Floor created');
    } catch (error) {
      console.error('Failed to create Floor:', error);
      throw error;
    }
  }

  /**
   * 销毁地面
   */
  destroy() {
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }

    if (this.gridHelper && this.gridHelper.parent) {
      this.gridHelper.parent.remove(this.gridHelper);
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
    this.gridHelper = null;
    this.material = null;
    this.geometry = null;
    this.texture = null;

    console.log('Floor destroyed');
  }
}
