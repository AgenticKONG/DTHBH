/**
 * 增强的交互管理器
 *
 * 职责:
 * - 画框交互（悬停、点击、高亮）
 * - 信息弹窗（作品详情、动画）
 * - 快捷键控制
 * - 触摸支持
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class EnhancedInteractionManager {
  constructor(camera, renderer, container) {
    this.camera = camera;
    this.renderer = renderer;
    this.container = container;

    // 射线检测
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 交互对象
    this.interactableObjects = [];
    this.hoveredObject = null;
    this.selectedObject = null;

    // 弹窗
    this.popup = null;
    this.popupVisible = false;

    // 事件回调
    this.callbacks = {
      onHover: null,
      onLeave: null,
      onClick: null,
      onDoubleClick: null,
      onPopupClose: null
    };

    // 高亮效果
    this.highlightEffect = {
      enabled: true,
      hoverColor: 0xffd700,
      selectedColor: 0x00ff00,
      originalColors: new Map()
    };

    // 事件监听器
    this.eventListeners = [];

    // 快捷键
    this.shortcuts = new Map();
  }

  /**
   * 初始化增强交互管理器
   */
  initialize() {
    this.setupEventListeners();
    this.setupShortcuts();
    console.log('EnhancedInteractionManager initialized');
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 鼠标事件
    const mouseMoveHandler = this.handleMouseMove.bind(this);
    const mouseClickHandler = this.handleMouseClick.bind(this);
    const mouseDoubleClickHandler = this.handleMouseDoubleClick.bind(this);

    this.container.addEventListener('mousemove', mouseMoveHandler);
    this.container.addEventListener('click', mouseClickHandler);
    this.container.addEventListener('dblclick', mouseDoubleClickHandler);

    this.eventListeners.push(
      { type: 'mousemove', handler: mouseMoveHandler },
      { type: 'click', handler: mouseClickHandler },
      { type: 'dblclick', handler: mouseDoubleClickHandler }
    );

    // 触摸事件
    const touchStartHandler = this.handleTouchStart.bind(this);
    const touchMoveHandler = this.handleTouchMove.bind(this);
    const touchEndHandler = this.handleTouchEnd.bind(this);

    this.container.addEventListener('touchstart', touchStartHandler);
    this.container.addEventListener('touchmove', touchMoveHandler);
    this.container.addEventListener('touchend', touchEndHandler);

    this.eventListeners.push(
      { type: 'touchstart', handler: touchStartHandler },
      { type: 'touchmove', handler: touchMoveHandler },
      { type: 'touchend', handler: touchEndHandler }
    );
  }

  /**
   * 设置快捷键
   */
  setupShortcuts() {
    // ESC - 关闭弹窗
    this.registerShortcut('Escape', () => {
      if (this.popupVisible) {
        this.hidePopup();
      }
    });

    // 数字键 1-5 - 切换展厅
    for (let i = 1; i <= 5; i++) {
      this.registerShortcut(`Digit${i}`, () => {
        if (this.callbacks.onHallSwitch) {
          this.callbacks.onHallSwitch(i);
        }
      });
    }

    // 空格键 - 暂停/继续
    this.registerShortcut('Space', () => {
      if (this.callbacks.onTogglePause) {
        this.callbacks.onTogglePause();
      }
    });

    // F键 - 切换全屏
    this.registerShortcut('KeyF', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        this.container.requestFullscreen();
      }
    });
  }

  /**
   * 注册快捷键
   */
  registerShortcut(keyCode, callback) {
    this.shortcuts.set(keyCode, callback);
  }

  /**
   * 处理键盘事件
   */
  handleKeyDown(event) {
    const callback = this.shortcuts.get(event.code);
    if (callback) {
      callback();
    }
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMove(event) {
    // 计算鼠标位置
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 射线检测
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);

    // 处理悬停效果
    if (intersects.length > 0) {
      const object = intersects[0].object;

      if (this.hoveredObject !== object) {
        // 离开上一个对象
        if (this.hoveredObject) {
          this.handleLeave(this.hoveredObject);
        }

        // 进入新对象
        this.hoveredObject = object;
        this.handleHover(object);
      }
    } else {
      if (this.hoveredObject) {
        this.handleLeave(this.hoveredObject);
        this.hoveredObject = null;
      }
    }
  }

  /**
   * 处理鼠标点击
   */
  handleMouseClick(event) {
    if (this.popupVisible && !this.isClickingOnPopup(event)) {
      this.hidePopup();
      return;
    }

    // 射线检测
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.handleClick(object);
    }
  }

  /**
   * 处理鼠标双击
   */
  handleMouseDoubleClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.handleDoubleClick(object);
    }
  }

  /**
   * 处理触摸开始
   */
  handleTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }
  }

  /**
   * 处理触摸移动
   */
  handleTouchMove(event) {
    event.preventDefault();

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    } else if (event.touches.length === 2) {
      // 双指缩放
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      if (this.lastTouchDistance) {
        const scale = distance / this.lastTouchDistance;
        this.handlePinchZoom(scale);
      }

      this.lastTouchDistance = distance;
    }
  }

  /**
   * 处理触摸结束
   */
  handleTouchEnd(event) {
    if (event.touches.length === 0) {
      this.lastTouchDistance = null;
      this.handleMouseClick(event);
    }
  }

  /**
   * 处理缩放
   */
  handlePinchZoom(scale) {
    if (this.callbacks.onZoom) {
      this.callbacks.onZoom(scale);
    }
  }

  /**
   * 处理悬停
   */
  handleHover(object) {
    if (!object.userData || !(object.userData.interactable || object.userData.interactive)) return;

    // 高亮效果
    if (this.highlightEffect.enabled && object.material) {
      if (!this.highlightEffect.originalColors.has(object.uuid)) {
        this.highlightEffect.originalColors.set(object.uuid, object.material.color.getHex());
      }

      object.material.color.setHex(this.highlightEffect.hoverColor);
    }

    // 触发回调
    if (this.callbacks.onHover) {
      this.callbacks.onHover(object);
    }

    // 改变鼠标样式
    this.container.style.cursor = 'pointer';
  }

  /**
   * 处理离开
   */
  handleLeave(object) {
    if (!object.userData || !(object.userData.interactable || object.userData.interactive)) return;

    // 恢复原色
    if (this.highlightEffect.enabled && object.material) {
      const originalColor = this.highlightEffect.originalColors.get(object.uuid);
      if (originalColor) {
        object.material.color.setHex(originalColor);
      }
    }

    // 触发回调
    if (this.callbacks.onLeave) {
      this.callbacks.onLeave(object);
    }

    // 恢复鼠标样式
    this.container.style.cursor = 'default';
  }

  /**
   * 处理点击
   */
  handleClick(object) {
    if (!object.userData || !(object.userData.interactable || object.userData.interactive)) return;

    // 选择效果
    if (this.highlightEffect.enabled && object.material) {
      if (this.selectedObject && this.selectedObject !== object) {
        const originalColor = this.highlightEffect.originalColors.get(this.selectedObject.uuid);
        if (originalColor) {
          this.selectedObject.material.color.setHex(originalColor);
        }
      }

      this.selectedObject = object;
      object.material.color.setHex(this.highlightEffect.selectedColor);
    }

    // 触发回调
    if (this.callbacks.onClick) {
      this.callbacks.onClick(object);
    }

    // 显示弹窗
    if (object.userData.artworkId || object.userData.type === 'thumbnail' || object.userData.type === 'panel') {
      this.showPopup(object);
    }
  }

  /**
   * 处理双击
   */
  handleDoubleClick(object) {
    if (!object.userData || !(object.userData.interactable || object.userData.interactive)) return;

    // 触发回调
    if (this.callbacks.onDoubleClick) {
      this.callbacks.onDoubleClick(object);
    }

    // 放大查看
    if (object.userData.artworkId) {
      this.zoomToObject(object);
    }
  }

  /**
   * 放大到对象
   */
  zoomToObject(object) {
    const targetPosition = object.position.clone();
    targetPosition.z += 5;

    gsap.to(this.camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1,
      ease: 'power2.inOut'
    });

    gsap.to(this.camera.position, {
      duration: 1,
      onUpdate: () => {
        this.camera.lookAt(object.position);
      },
      ease: 'power2.inOut'
    });
  }

  /**
   * 显示弹窗
   */
  showPopup(object) {
    const { scene } = this.renderer;
    const userData = object.userData;

    // 创建弹窗
    const popupGeometry = new THREE.PlaneGeometry(4, 3);
    const popupMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1f1a,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    this.popup = new THREE.Mesh(popupGeometry, popupMaterial);
    this.popup.position.copy(
      this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3))
    );
    this.popup.lookAt(this.camera.position);

    scene.add(this.popup);
    this.popupVisible = true;

    // 动画显示
    gsap.from(this.popup.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });

    // 弹窗跟随相机
    this.popupUpdateInterval = setInterval(() => {
      if (this.popup) {
        this.popup.position.copy(
          this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3))
        );
        this.popup.lookAt(this.camera.position);
      }
    }, 16);
  }

  /**
   * 隐藏弹窗
   */
  hidePopup() {
    if (this.popup) {
      // 动画隐藏
      gsap.to(this.popup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          this.renderer.scene.remove(this.popup);
          this.popup = null;
          this.popupVisible = false;
        }
      });

      // 停止跟随
      if (this.popupUpdateInterval) {
        clearInterval(this.popupUpdateInterval);
        this.popupUpdateInterval = null;
      }

      // 触发回调
      if (this.callbacks.onPopupClose) {
        this.callbacks.onPopupClose();
      }
    }
  }

  /**
   * 检查是否点击在弹窗上
   */
  isClickingOnPopup(event) {
    if (!this.popup) return false;

    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 检查点击是否在弹窗区域内
    return true; // 简化处理，实际需要计算弹窗位置
  }

  /**
   * 添加可交互对象
   */
  addInteractableObject(object) {
    if (!this.interactableObjects.includes(object)) {
      this.interactableObjects.push(object);
    }
  }

  /**
   * 移除可交互对象
   */
  removeInteractableObject(object) {
    const index = this.interactableObjects.indexOf(object);
    if (index > -1) {
      this.interactableObjects.splice(index, 1);
    }
  }

  /**
   * 清空可交互对象
   */
  clearInteractableObjects() {
    this.interactableObjects = [];
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
   * 启用/禁用高亮效果
   */
  setHighlightEnabled(enabled) {
    this.highlightEffect.enabled = enabled;
  }

  /**
   * 设置高亮颜色
   */
  setHighlightColors(hoverColor, selectedColor) {
    this.highlightEffect.hoverColor = hoverColor;
    this.highlightEffect.selectedColor = selectedColor;
  }

  /**
   * 销毁增强交互管理器
   */
  destroy() {
    // 移除事件监听器
    this.eventListeners.forEach(({ type, handler }) => {
      this.container.removeEventListener(type, handler);
    });

    this.eventListeners = [];

    // 隐藏弹窗
    this.hidePopup();

    // 清空数据
    this.interactableObjects = [];
    this.hoveredObject = null;
    this.selectedObject = null;
    this.shortcuts.clear();
    this.highlightEffect.originalColors.clear();

    // 清空回调
    this.callbacks = {
      onHover: null,
      onLeave: null,
      onClick: null,
      onDoubleClick: null,
      onPopupClose: null
    };

    console.log('EnhancedInteractionManager destroyed');
  }
}
