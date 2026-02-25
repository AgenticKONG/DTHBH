/**
 * 交互管理器
 *
 * 职责:
 * - 管理所有3D交互（点击、悬停、拖拽等）
 * - 处理射线检测
 * - 管理交互事件回调
 * - 支持多选和选择状态管理
 * - 提供交互动画
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export class InteractionManager {
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
    this.selectedObjects = new Set();

    // 事件回调
    this.callbacks = {
      onHover: null,
      onLeave: null,
      onClick: null,
      onDoubleClick: null,
      onRightClick: null,
      onDragStart: null,
      onDrag: null,
      onDragEnd: null
    };

    // 拖拽状态
    this.isDragging = false;
    this.draggedObject = null;
    this.dragStartPoint = new THREE.Vector3();
    this.dragOffset = new THREE.Vector3();

    // 点击检测
    this.lastClickTime = 0;
    this.lastClickObject = null;

    // 交互配置
    this.config = {
      enableHover: true,
      enableClick: true,
      enableDoubleClick: true,
      enableRightClick: true,
      enableDrag: false,
      doubleClickDelay: 300,
      dragThreshold: 5
    };

    // 动画队列
    this.animations = [];
  }

  /**
   * 初始化交互管理器
   */
  initialize() {
    this.addEventListeners();
    console.log('InteractionManager initialized');
  }

  /**
   * 添加事件监听器
   */
  addEventListeners() {
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.container.addEventListener('contextmenu', this.handleRightClick.bind(this));
    this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.removeEventListener('click', this.handleClick.bind(this));
    this.container.removeEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.container.removeEventListener('contextmenu', this.handleRightClick.bind(this));
    this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.container.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  /**
   * 添加可交互对象
   */
  addInteractableObject(object, userData = {}) {
    if (!object) return;

    object.userData = {
      isInteractive: true,
      ...userData
    };

    this.interactableObjects.push(object);
  }

  /**
   * 移除可交互对象
   */
  removeInteractableObject(object) {
    const index = this.interactableObjects.indexOf(object);
    if (index > -1) {
      this.interactableObjects.splice(index, 1);
    }

    // 从选中对象中移除
    this.selectedObjects.delete(object);
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMove(event) {
    // 更新鼠标位置
    this.updateMousePosition(event);

    if (this.config.enableHover) {
      this.checkHover();
    }

    // 处理拖拽
    if (this.isDragging && this.draggedObject) {
      this.handleDrag(event);
    }
  }

  /**
   * 处理点击
   */
  handleClick(event) {
    if (!this.config.enableClick) return;

    const clickedObject = this.getIntersectedObject();

    // 双击检测
    const currentTime = Date.now();
    const isDoubleClick =
      clickedObject === this.lastClickObject && currentTime - this.lastClickTime < this.config.doubleClickDelay;

    if (isDoubleClick) {
      return; // 由双击事件处理
    }

    this.lastClickTime = currentTime;
    this.lastClickObject = clickedObject;

    if (clickedObject) {
      // 触发点击回调
      if (this.callbacks.onClick) {
        this.callbacks.onClick(clickedObject, event);
      }

      // 处理对象点击
      this.handleObjectClick(clickedObject);
    } else {
      // 点击空白处，取消选择
      this.clearSelection();
    }
  }

  /**
   * 处理双击
   */
  handleDoubleClick(event) {
    if (!this.config.enableDoubleClick) return;

    const clickedObject = this.getIntersectedObject();

    if (clickedObject) {
      // 触发双击回调
      if (this.callbacks.onDoubleClick) {
        this.callbacks.onDoubleClick(clickedObject, event);
      }

      // 处理对象双击
      this.handleObjectDoubleClick(clickedObject);
    }
  }

  /**
   * 处理右键点击
   */
  handleRightClick(event) {
    if (!this.config.enableRightClick) return;

    event.preventDefault();

    const clickedObject = this.getIntersectedObject();

    if (clickedObject) {
      // 触发右键回调
      if (this.callbacks.onRightClick) {
        this.callbacks.onRightClick(clickedObject, event);
      }
    }
  }

  /**
   * 处理鼠标按下
   */
  handleMouseDown(event) {
    if (!this.config.enableDrag) return;

    const clickedObject = this.getIntersectedObject();

    if (clickedObject && clickedObject.userData.draggable) {
      this.isDragging = true;
      this.draggedObject = clickedObject;

      // 记录拖拽起始点
      const intersection = this.getIntersection(clickedObject);
      if (intersection) {
        this.dragStartPoint.copy(intersection.point);
        this.dragOffset.copy(clickedObject.position).sub(this.dragStartPoint);
      }

      // 触发拖拽开始回调
      if (this.callbacks.onDragStart) {
        this.callbacks.onDragStart(clickedObject, event);
      }
    }
  }

  /**
   * 处理鼠标释放
   */
  handleMouseUp(event) {
    if (this.isDragging && this.draggedObject) {
      // 触发拖拽结束回调
      if (this.callbacks.onDragEnd) {
        this.callbacks.onDragEnd(this.draggedObject, event);
      }

      this.isDragging = false;
      this.draggedObject = null;
    }
  }

  /**
   * 处理拖拽
   */
  handleDrag(event) {
    if (!this.draggedObject) return;

    // 更新鼠标位置
    this.updateMousePosition(event);

    // 计算新的位置
    const intersection = this.getIntersectionAtPlane(event);
    if (intersection) {
      const newPosition = intersection.point.clone().add(this.dragOffset);
      this.draggedObject.position.copy(newPosition);
    }

    // 触发拖拽回调
    if (this.callbacks.onDrag) {
      this.callbacks.onDrag(this.draggedObject, event);
    }
  }

  /**
   * 更新鼠标位置
   */
  updateMousePosition(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * 检查悬停
   */
  checkHover() {
    const intersectedObject = this.getIntersectedObject();

    if (intersectedObject !== this.hoveredObject) {
      // 离开当前对象
      if (this.hoveredObject) {
        this.handleObjectLeave(this.hoveredObject);
      }

      // 进入新对象
      if (intersectedObject) {
        this.handleObjectHover(intersectedObject);
      }

      this.hoveredObject = intersectedObject;
    }
  }

  /**
   * 获取相交对象
   */
  getIntersectedObject() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactableObjects, false);

    if (intersects.length > 0) {
      return intersects[0].object;
    }

    return null;
  }

  /**
   * 获取相交点
   */
  getIntersection(object) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(object);

    if (intersects.length > 0) {
      return intersects[0];
    }

    return null;
  }

  /**
   * 获取平面上的相交点
   */
  getIntersectionAtPlane(event) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 创建一个虚拟平面用于拖拽
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();

    this.raycaster.ray.intersectPlane(plane, intersection);

    return intersection;
  }

  /**
   * 处理对象悬停
   */
  handleObjectHover(object) {
    // 触发对象悬停回调
    if (object.userData.onHover) {
      object.userData.onHover(object);
    }

    // 触发全局悬停回调
    if (this.callbacks.onHover) {
      this.callbacks.onHover(object);
    }

    // 悬停动画
    this.playHoverAnimation(object);
  }

  /**
   * 处理对象离开
   */
  handleObjectLeave(object) {
    // 触发对象离开回调
    if (object.userData.onLeave) {
      object.userData.onLeave(object);
    }

    // 触发全局离开回调
    if (this.callbacks.onLeave) {
      this.callbacks.onLeave(object);
    }

    // 离开动画
    this.playLeaveAnimation(object);
  }

  /**
   * 处理对象点击
   */
  handleObjectClick(object) {
    // 切换选中状态
    if (this.selectedObjects.has(object)) {
      this.deselectObject(object);
    } else {
      this.selectObject(object);
    }

    // 触发对象点击回调
    if (object.userData.onClick) {
      object.userData.onClick(object);
    }
  }

  /**
   * 处理对象双击
   */
  handleObjectDoubleClick(object) {
    // 触发对象双击回调
    if (object.userData.onDoubleClick) {
      object.userData.onDoubleClick(object);
    }
  }

  /**
   * 选择对象
   */
  selectObject(object) {
    this.selectedObjects.add(object);

    // 选中动画
    this.playSelectAnimation(object);
  }

  /**
   * 取消选择对象
   */
  deselectObject(object) {
    this.selectedObjects.delete(object);

    // 取消选中动画
    this.playDeselectAnimation(object);
  }

  /**
   * 清除选择
   */
  clearSelection() {
    this.selectedObjects.forEach((object) => {
      this.deselectObject(object);
    });
  }

  /**
   * 播放悬停动画
   */
  playHoverAnimation(object) {
    // 缩放动画
    gsap.to(object.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * 播放离开动画
   */
  playLeaveAnimation(object) {
    // 恢复缩放
    gsap.to(object.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * 播放选中动画
   */
  playSelectAnimation(object) {
    // 缩放动画
    gsap.to(object.scale, {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * 播放取消选中动画
   */
  playDeselectAnimation(object) {
    // 恢复缩放
    gsap.to(object.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  /**
   * 设置事件回调
   */
  setCallback(event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.callbacks, event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * 获取选中对象
   */
  getSelectedObjects() {
    return Array.from(this.selectedObjects);
  }

  /**
   * 销毁交互管理器
   */
  destroy() {
    // 移除事件监听器
    this.removeEventListeners();

    // 清空交互对象
    this.interactableObjects = [];
    this.selectedObjects.clear();
    this.hoveredObject = null;

    // 停止所有动画
    this.animations.forEach((animation) => {
      gsap.killTweensOf(animation);
    });
    this.animations = [];

    console.log('InteractionManager destroyed');
  }
}
