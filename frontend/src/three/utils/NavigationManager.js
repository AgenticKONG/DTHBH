/**
 * 导航管理器
 *
 * 职责:
 * - 管理自主漫游模式（WASD移动、鼠标视角）
 * - 管理展览构成模式（展厅导航）
 * - 管理三维缩略图模式
 * - 碰撞检测
 * - 导航模式切换
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class NavigationManager {
  constructor(camera, scene, container) {
    this.camera = camera;
    this.scene = scene;
    this.container = container;

    // 导航模式
    this.modes = {
      FREE_ROAM: 'free-roam', // 自主漫游
      EXHIBITION: 'exhibition', // 展览构成
      THUMBNAIL: 'thumbnail' // 三维缩略图
    };

    this.currentMode = this.modes.FREE_ROAM;

    // 自主漫游参数
    this.freeRoam = {
      moveSpeed: 5,
      lookSpeed: 0.002,
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      velocity: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      isRotating: false,
      lastMouseX: null,
      lastMouseY: null
    };

    // 碰撞检测
    this.collision = {
      enabled: true,
      playerRadius: 0.5,
      obstacles: [],
      boundaries: { minX: -20, maxX: 20, minZ: -40, maxZ: 40 }
    };

    // 事件监听器
    this.eventListeners = [];

    // 回调函数
    this.callbacks = {
      onModeChange: null,
      onCollision: null,
      onPositionUpdate: null
    };
  }

  /**
   * 初始化导航管理器
   */
  initialize() {
    this.setupEventListeners();
    console.log('NavigationManager initialized');
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 键盘事件（添加到document以确保捕获所有键盘事件）
    const keydownHandler = this.onKeyDown.bind(this);
    const keyupHandler = this.onKeyUp.bind(this);

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);

    this.eventListeners.push(
      { type: 'keydown', handler: keydownHandler, target: document },
      { type: 'keyup', handler: keyupHandler, target: document }
    );

    // 鼠标事件
    const mouseDownHandler = this.onMouseDown.bind(this);
    const mouseMoveHandler = this.onMouseMove.bind(this);
    const mouseUpHandler = this.onMouseUp.bind(this);

    this.container.addEventListener('mousedown', mouseDownHandler);
    this.container.addEventListener('mousemove', mouseMoveHandler);
    this.container.addEventListener('mouseup', mouseUpHandler);
    this.container.addEventListener('mouseleave', mouseUpHandler); // 鼠标离开容器时也停止旋转

    this.eventListeners.push(
      { type: 'mousedown', handler: mouseDownHandler },
      { type: 'mousemove', handler: mouseMoveHandler },
      { type: 'mouseup', handler: mouseUpHandler },
      { type: 'mouseleave', handler: mouseUpHandler }
    );
  }

  /**
   * 键盘按下事件
   */
  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.freeRoam.moveForward = true;
        console.log('W/Up pressed - moving forward');
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.freeRoam.moveBackward = true;
        console.log('S/Down pressed - moving backward');
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.freeRoam.moveLeft = true;
        console.log('A/Left pressed - moving left');
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.freeRoam.moveRight = true;
        console.log('D/Right pressed - moving right');
        break;
    }
  }

  /**
   * 键盘释放事件
   */
  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.freeRoam.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.freeRoam.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.freeRoam.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.freeRoam.moveRight = false;
        break;
    }
  }

  /**
   * 鼠标移动事件 - 处理视角旋转
   */
  onMouseMove(event) {
    // 只有在按住鼠标左键时才旋转视角
    if (this.freeRoam.isRotating) {
      const deltaX = event.clientX - this.freeRoam.lastMouseX;
      const deltaY = event.clientY - this.freeRoam.lastMouseY;

      // 使用欧拉角进行旋转
      this.freeRoam.euler.setFromQuaternion(this.camera.quaternion);
      this.freeRoam.euler.y -= deltaX * this.freeRoam.lookSpeed;
      this.freeRoam.euler.x -= deltaY * this.freeRoam.lookSpeed;
      
      // 限制上下视角
      this.freeRoam.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.freeRoam.euler.x));
      
      this.camera.quaternion.setFromEuler(this.freeRoam.euler);

      this.freeRoam.lastMouseX = event.clientX;
      this.freeRoam.lastMouseY = event.clientY;
    }
  }

  /**
   * 鼠标按下事件
   */
  onMouseDown(event) {
    if (this.currentMode === this.modes.FREE_ROAM && event.button === 0) {
      // 左键按下，开始旋转视角
      this.freeRoam.isRotating = true;
      this.freeRoam.lastMouseX = event.clientX;
      this.freeRoam.lastMouseY = event.clientY;
      this.container.style.cursor = 'grabbing';
    }
  }

  /**
   * 鼠标释放事件
   */
  onMouseUp(event) {
    if (this.currentMode === this.modes.FREE_ROAM) {
      // 停止旋转视角
      this.freeRoam.isRotating = false;
      this.freeRoam.lastMouseX = null;
      this.freeRoam.lastMouseY = null;
      this.container.style.cursor = 'default';
    }
  }

  /**
   * 更新导航（在渲染循环中调用）
   */
  update(deltaTime) {
    if (this.currentMode === this.modes.FREE_ROAM) {
      this.updateFreeRoam(deltaTime);
    }
  }

  /**
   * 更新自主漫游
   */
  updateFreeRoam(deltaTime) {
    // 仅在按键被按下时才进行移动
    if (this.freeRoam.moveForward || this.freeRoam.moveBackward || this.freeRoam.moveLeft || this.freeRoam.moveRight) {
      // 获取相机的前方和右方向量
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      right.crossVectors(forward, this.camera.up).normalize();

      // 衰减速度（摩擦力效果）
      this.freeRoam.velocity.x -= this.freeRoam.velocity.x * 5.0 * deltaTime;
      this.freeRoam.velocity.z -= this.freeRoam.velocity.z * 5.0 * deltaTime;

      // 根据按键添加速度
      if (this.freeRoam.moveForward) {
        // W键 - 向前移动（沿着相机前方）
        this.freeRoam.velocity.x += forward.x * this.freeRoam.moveSpeed;
        this.freeRoam.velocity.z += forward.z * this.freeRoam.moveSpeed;
      }

      if (this.freeRoam.moveBackward) {
        // S键 - 向后移动（沿着相机后方）
        this.freeRoam.velocity.x -= forward.x * this.freeRoam.moveSpeed;
        this.freeRoam.velocity.z -= forward.z * this.freeRoam.moveSpeed;
      }

      if (this.freeRoam.moveLeft) {
        // A键 - 向左移动（沿着相机左方）
        this.freeRoam.velocity.x -= right.x * this.freeRoam.moveSpeed;
        this.freeRoam.velocity.z -= right.z * this.freeRoam.moveSpeed;
      }

      if (this.freeRoam.moveRight) {
        // D键 - 向右移动（沿着相机右方）
        this.freeRoam.velocity.x += right.x * this.freeRoam.moveSpeed;
        this.freeRoam.velocity.z += right.z * this.freeRoam.moveSpeed;
      }

      // 应用移动（velocity已经是速度，需要乘以deltaTime）
      const moveX = this.freeRoam.velocity.x * deltaTime;
      const moveZ = this.freeRoam.velocity.z * deltaTime;

      // 简化碰撞检测，只做边界限制，不取消移动
      const newPosition = this.camera.position.clone();

      // 应用移动
      newPosition.x += moveX;
      newPosition.z += moveZ;

      // 只做边界限制（硬限制，防止穿墙）
      if (this.collision.enabled) {
        // 计算边界
        const minX = this.collision.boundaries.minX + this.collision.playerRadius;
        const maxX = this.collision.boundaries.maxX - this.collision.playerRadius;
        const minZ = this.collision.boundaries.minZ + this.collision.playerRadius;
        const maxZ = this.collision.boundaries.maxZ - this.collision.playerRadius;

        // 直接限制位置在边界内
        newPosition.x = Math.max(minX, Math.min(maxX, newPosition.x));
        newPosition.z = Math.max(minZ, Math.min(maxZ, newPosition.z));
      }

      // 直接设置相机位置，确保位置准确
      this.camera.position.copy(newPosition);
    }

    // 触发位置更新回调
    if (this.callbacks.onPositionUpdate) {
      this.callbacks.onPositionUpdate(this.camera.position);
    }
  }

  /**
   * 碰撞检测
   */
  checkCollision(position) {
    if (!this.collision.enabled) return false;

    // 边界检测
    if (
      position.x < this.collision.boundaries.minX + this.collision.playerRadius ||
      position.x > this.collision.boundaries.maxX - this.collision.playerRadius ||
      position.z < this.collision.boundaries.minZ + this.collision.playerRadius ||
      position.z > this.collision.boundaries.maxZ - this.collision.playerRadius
    ) {
      return true;
    }

    // 障碍物检测
    for (const obstacle of this.collision.obstacles) {
      const dx = position.x - obstacle.x;
      const dz = position.z - obstacle.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < obstacle.radius + this.collision.playerRadius) {
        return true;
      }
    }

    return false;
  }

  /**
   * 添加障碍物
   */
  addObstacle(obstacle) {
    this.collision.obstacles.push(obstacle);
  }

  /**
   * 清除所有障碍物
   */
  clearObstacles() {
    this.collision.obstacles = [];
  }

  /**
   * 设置边界
   */
  setBoundaries(boundaries) {
    this.collision.boundaries = { ...this.collision.boundaries, ...boundaries };
  }

  /**
   * 切换导航模式
   */
  switchMode(mode) {
    if (!Object.values(this.modes).includes(mode)) {
      console.warn(`Invalid navigation mode: ${mode}`);
      return;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // 退出指针锁定
    if (previousMode === this.modes.FREE_ROAM && mode !== this.modes.FREE_ROAM) {
      document.exitPointerLock();
    }

    // 触发模式切换回调
    if (this.callbacks.onModeChange) {
      this.callbacks.onModeChange(previousMode, mode);
    }

    console.log(`Navigation mode switched: ${previousMode} -> ${mode}`);
  }

  /**
   * 移动到指定位置
   */
  moveTo(position, duration = 1) {
    return new Promise((resolve) => {
      gsap.to(this.camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration,
        ease: 'power2.inOut',
        onComplete: () => {
          if (this.callbacks.onPositionUpdate) {
            this.callbacks.onPositionUpdate(this.camera.position.clone());
          }
          resolve();
        }
      });
    });
  }

  /**
   * 移动到指定展厅
   */
  moveToHall(hallId, hallPosition) {
    // 计算目标位置（展厅前方）
    const targetPosition = hallPosition.clone();
    targetPosition.z -= 5;

    return this.moveTo(targetPosition, 2);
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
   * 获取当前位置
   */
  getPosition() {
    return this.camera.position.clone();
  }

  /**
   * 获取当前模式
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * 设置移动速度
   */
  setMoveSpeed(speed) {
    this.freeRoam.moveSpeed = speed;
  }

  /**
   * 设置视角速度
   */
  setLookSpeed(speed) {
    this.freeRoam.lookSpeed = speed;
  }

  /**
   * 启用/禁用碰撞检测
   */
  setCollisionEnabled(enabled) {
    this.collision.enabled = enabled;
  }

  /**
   * 销毁导航管理器
   */
  destroy() {
    // 移除事件监听器
    this.eventListeners.forEach(({ type, handler }) => {
      this.container.removeEventListener(type, handler);
    });

    // 清空事件监听器
    this.eventListeners = [];

    // 退出指针锁定
    document.exitPointerLock();

    // 清空回调
    this.callbacks = {
      onModeChange: null,
      onCollision: null,
      onPositionUpdate: null
    };

    console.log('NavigationManager destroyed');
  }
}
