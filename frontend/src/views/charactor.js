import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import gsap from 'gsap';

/**
 * 创建人物介绍面板
 * @param {THREE.Scene} scene - Three.js场景对象
 * @param {Object} options - 配置选项
 * @param {number} options.corridorLength - 走廊长度
 * @param {number} options.corridorHeight - 走廊高度
 * @param {number} options.introZ - 介绍面板在Z轴的位置，默认为走廊中央
 * @param {number} options.panelWidth - 面板宽度，默认为6
 * @param {number} options.panelHeight - 面板高度，默认为3
 * @param {THREE.Vector3} options.position - 面板位置，如果指定则覆盖introZ计算
 * @param {Object} options.content - 文字内容配置
 * @param {string} options.content.name - 人物姓名
 * @param {string} options.content.lifespan - 生卒年份
 * @param {string} options.content.title - 人物头衔
 * @param {string} options.content.honor - 荣誉称号
 * @param {string} options.content.detail - 详细信息
 */
export default function createPersonIntroduction(scene, options = {}) {
  // 默认配置
  const config = {
    corridorLength: 60,
    corridorHeight: 14,
    introZ: options.corridorLength ? options.corridorLength / 2 : 30,
    panelWidth: 6,
    panelHeight: 3,
    position: null,
    content: {
      name: '黄宾虹',
      lifespan: '1865 - 1955',
      title: '中国近代杰出画家、书法家',
      honor: '山水画一代宗师',
      detail: '原名懋质，名质，字朴存、朴岑、亦作朴丞、劈琴<br>号宾虹，别署予向、虹叟、黄山山中人等'
    },
    ...options
  };

  // 计算面板位置
  let panelPosition;
  if (config.position && config.position instanceof THREE.Vector3) {
    // 使用指定的位置
    panelPosition = config.position;
  } else {
    // 使用默认计算的位置
    panelPosition = new THREE.Vector3(0, config.corridorHeight - 3, config.introZ);
  }

  // 创建展板背景
  const panelGeometry = new THREE.PlaneGeometry(config.panelWidth, config.panelHeight);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc, // 米白色背景
    roughness: 0.7,
    metalness: 0.1
  });

  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  panel.position.copy(panelPosition);
  panel.rotation.y = Math.PI;

  // 添加画框
  const frameGeometry = new THREE.BoxGeometry(config.panelWidth + 0.2, config.panelHeight + 0.2, 0.1);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    opacity: 0.8,
    transparent: true
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.copy(panelPosition);
  frame.position.z += 0.25;
  frame.position.z -= 0.06;
  frame.rotation.x = panel.rotation.x;

  // 使用CSS2D添加文字
  const textElement = createInfoText(panel.position, scene, config.content);
  textElement.visible = false;
  scene.add(textElement);

  // 添加照明效果
  addIntroductionLighting(scene, panelPosition);

  console.log('人物介绍面板已创建');

  return {
    panel,
    frame,
    textElement,
    showDistance: 15, // 显示距离
    hideDistance: 12 // 隐藏距离
  };
}

/**
 * 创建信息文字
 * @param {THREE.Vector3} position - 文字位置
 * @param {THREE.Scene} scene - Three.js场景对象
 * @param {Object} content - 文字内容配置
 */
function createInfoText(position, scene, content) {
  const introDiv = document.createElement('div');
  introDiv.className = 'person-intro';
  introDiv.innerHTML = `
    <div style="text-align: center; color: #8B4513; font-family: 'SimSun', '宋体', serif;">
      <h2 style="margin-bottom: 15px; font-size: 32px; font-weight: bold;">${content.name}</h2>
      <p style="margin: 8px 0; font-size: 20px; color: #8B4513;">${content.lifespan}</p>
      <p style="margin: 8px 0; font-size: 18px;">${content.title}</p>
      <p style="margin: 8px 0; font-size: 18px; color: #A52A2A;">${content.honor}</p>
      <p style="margin: 8px 0; font-size: 16px; color: #666; line-height: 1.4;">
        ${content.detail}
      </p>
    </div>
  `;

  introDiv.style.backgroundColor = 'rgba(245, 245, 220, 0.95)';
  introDiv.style.padding = '25px';
  introDiv.style.borderRadius = '8px';
  introDiv.style.border = '3px solid #8B4513';
  introDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
  introDiv.style.width = '450px';
  introDiv.style.backdropFilter = 'blur(5px)';

  const introLabel = new CSS2DObject(introDiv);
  introLabel.position.copy(position);
  introLabel.position.y += 0.3;
  return introLabel;
}

/**
 * 添加介绍区域的照明
 * @param {THREE.Scene} scene - Three.js场景对象
 * @param {THREE.Vector3} panelPosition - 面板位置
 */
function addIntroductionLighting(scene, panelPosition) {
  // 添加聚光灯突出介绍区域
  const spotLight = new THREE.SpotLight(0xfff8e1, 2, 15, Math.PI / 8, 0.5);
  spotLight.position.set(panelPosition.x, panelPosition.y + 2, panelPosition.z - 4);
  spotLight.target.position.copy(panelPosition);
  scene.add(spotLight.target);
  scene.add(spotLight);

  // 添加点光源补充照明
  const pointLight = new THREE.PointLight(0xfff8e1, 0.8, 10);
  pointLight.position.copy(panelPosition);
  pointLight.position.y += 1;
  scene.add(pointLight);
}

export class IntroManager {
  constructor(camera) {
    this.intros = [];
    this.camera = camera;
    this.currentVisibleIntro = null;
  }

  addIntro(introObject) {
    if (introObject.textElement.element) {
      const element = introObject.textElement.element;
      gsap.set(element, {
        opacity: 0,
        scale: 0.8,
        rotationY: 10
      });
    }
    this.intros.push(introObject);
  }

  showIntro(intro) {
    const element = intro.textElement.element;
    if (!element) return;

    intro.textElement.visible = true;

    // GSAP 动画
    gsap.to(element, {
      opacity: 1,
      scale: 1,
      rotationY: 0,
      duration: 0,
      ease: 'back.out(1.2)',
      overwrite: true
    });
  }

  hideIntro(intro) {
    const element = intro.textElement.element;
    if (!element) return;

    gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      rotationY: -10,
      duration: 0,
      ease: 'power2.in',
      onComplete: () => {
        intro.textElement.visible = false;
      }
    });
  }

  update() {
    let closestIntro = null;
    let closestDistance = Infinity;

    // 找到最近的介绍面板
    this.intros.forEach((intro) => {
      const distance = intro.panel.position.distanceTo(this.camera.position);

      if (distance < intro.showDistance) {
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIntro = intro;
        }
      }
    });

    // 显示/隐藏逻辑
    if (closestIntro && closestIntro !== this.currentVisibleIntro) {
      // 隐藏当前显示的
      if (this.currentVisibleIntro) {
        this.hideIntro(this.currentVisibleIntro);
      }
      // 显示新的
      this.showIntro(closestIntro);
      this.currentVisibleIntro = closestIntro;
    } else if (!closestIntro && this.currentVisibleIntro) {
      // 如果距离太远，隐藏
      const distance = this.currentVisibleIntro.panel.position.distanceTo(this.camera.position);
      if (distance > this.currentVisibleIntro.hideDistance) {
        this.hideIntro(this.currentVisibleIntro);
        this.currentVisibleIntro = null;
      }
    }
  }
}
