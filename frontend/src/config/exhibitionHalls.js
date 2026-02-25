/**
 * 数字展厅配置文件
 * 支持多展厅、可配置的展厅参数
 */

// 展厅类型枚举
export const HallType = {
  ENTRANCE: 'entrance', // 入口大厅
  MAIN: 'main', // 主展厅
  SPECIAL: 'special' // 特色展厅
};

// 展厅时期分类
export const PeriodType = {
  EARLY: 'early', // 早期（白宾虹）
  MIDDLE: 'middle', // 中期（黄宾虹）
  LATE: 'late' // 晚期（黑宾虹）
};

/**
 * 展厅配置
 */
export const exhibitionHalls = [
  // 入口大厅（序厅）
  {
    id: 'entrance',
    name: '入口大厅',
    type: HallType.ENTRANCE,
    description: '黄宾虹数字艺术展 - 永久展厅',
    // 空间参数
    space: {
      length: 50,
      width: 24,
      height: 10,
      wallThickness: 0.2
    },
    // 材质配置
    materials: {
      wall: {
        color: 0xfff5f0,
        roughness: 0.6,
        metalness: 0.1
      },
      floor: {
        color: 0xf0e6d2,
        roughness: 0.2,
        metalness: 0.7,
        opacity: 0.9,
        transparent: true
      },
      ceiling: {
        color: 0xfff5f0,
        roughness: 0.8,
        metalness: 0.5
      }
    },
    // 灯光配置
    lighting: {
      ambient: {
        color: 0xfffff0,
        intensity: 0.8
      },
      directional: [
        {
          color: 0xfff8e1,
          intensity: 2.0,
          position: { x: 0, y: 15, z: 20 }
        }
      ]
    },
    // 相机初始位置
    camera: {
      position: { x: 0, y: 4, z: 8 },
      target: { x: 0, y: 4, z: 35 }
    },
    // 展品配置（入口无展品，仅作为导览空间）
    paintings: [],
    // 介绍面板（展览导览）
    intros: [
      {
        name: '黄宾虹',
        lifespan: '1865 - 1955',
        title: '中国近代杰出画家、书法家',
        honor: '山水画一代宗师',
        detail: '原名懋质，名质，字朴存、朴岑、亦作朴丞、劈琴<br>号宾虹，别署予向、虹叟、黄山山中人等',
        position: { x: 0, y: 4, z: 20 },
        panelWidth: 10,
        panelHeight: 6
      },
      {
        name: '展览导览',
        lifespan: '永久展览',
        title: '参观指南',
        honor: '三大时期展厅',
        detail:
          '本展按黄宾虹艺术发展分为三个时期：<br>• 早期展厅（白宾虹 1865-1930）：疏淡清逸<br>• 盛期展厅（黄宾虹 1930-1948）：浑厚华滋<br>• 晚期展厅（黑宾虹 1948-1955）：黑密厚重',
        position: { x: -9, y: 4, z: 25 },
        panelWidth: 6,
        panelHeight: 7
      },
      {
        name: '艺术成就',
        lifespan: '终生贡献',
        title: '艺术成就',
        honor: '中国山水画集大成者',
        detail: '提出"五笔七墨"说，将中国画笔墨理论推向新高度；创作数千件作品，对现代山水画产生深远影响。',
        position: { x: 9, y: 4, z: 25 },
        panelWidth: 6,
        panelHeight: 7
      },
      {
        name: '参观提示',
        lifespan: '注意事项',
        title: '参观提示',
        honor: '参观须知',
        detail:
          '• 使用键盘W/S或方向键前后移动<br>• 点击入口标记进入各个展厅<br>• 点击介绍面板可关闭<br>• 建议按照早期→盛期→晚期的顺序参观',
        position: { x: 0, y: 3, z: 30 },
        panelWidth: 8,
        panelHeight: 5
      }
    ],
    // 关联展厅（从入口可以进入的展厅）
    linkedHalls: ['early', 'middle', 'late'],
    // 入口标记（显示在展厅入口）
    entranceMarkers: [
      {
        label: '早期展厅\n1865-1930\n白宾虹时期',
        targetHall: 'early',
        position: { x: -6, y: 2, z: 35 }
      },
      {
        label: '盛期展厅\n1930-1948\n黄宾虹时期',
        targetHall: 'middle',
        position: { x: 0, y: 2, z: 35 }
      },
      {
        label: '晚期展厅\n1948-1955\n黑宾虹时期',
        targetHall: 'late',
        position: { x: 6, y: 2, z: 35 }
      }
    ]
  },

  // 早期展厅（白宾虹）
  {
    id: 'early',
    name: '早期展厅',
    type: HallType.MAIN,
    period: PeriodType.EARLY,
    description: '白宾虹时期（1865-1930）- 疏淡清逸',
    // 空间参数（扩大空间以容纳更多展品）
    space: {
      length: 80,
      width: 16,
      height: 12,
      wallThickness: 0.1
    },
    // 材质配置（清新淡雅）
    materials: {
      wall: {
        color: 0xfffaf0,
        roughness: 0.5,
        metalness: 0.1
      },
      floor: {
        color: 0xf5f0e6,
        roughness: 0.3,
        metalness: 0.5,
        opacity: 0.9,
        transparent: true
      },
      ceiling: {
        color: 0xfffaf0,
        roughness: 0.7,
        metalness: 0.4
      }
    },
    // 灯光配置（清新淡雅）
    lighting: {
      ambient: {
        color: 0xfffff8,
        intensity: 0.9
      },
      directional: [
        {
          color: 0xfffaf0,
          intensity: 2.5,
          position: { x: -8, y: 4, z: 40 }
        },
        {
          color: 0xfffaf0,
          intensity: 2.5,
          position: { x: 11, y: 4, z: 40 }
        }
      ]
    },
    // 相机初始位置
    camera: {
      position: { x: 0, y: 4, z: 10 },
      target: { x: 0, y: 4, z: 70 }
    },
    // 展品配置（按时间顺序排列）
    paintings: [
      // 左墙展品（按创作时间顺序）
      { id: 1, url: '/images/春山红树.jpg', period: 'early', title: '春山红树', year: '1885-1890' },
      { id: 2, url: '/images/青山古寺.jpg', period: 'early', title: '青山古寺', year: '1890-1895' },
      { id: 3, url: '/images/夏花.jpg', period: 'early', title: '夏花', year: '1895-1900' },
      { id: 4, url: '/images/牡丹海棠.jpg', period: 'early', title: '牡丹海棠', year: '1900-1905' },
      { id: 5, url: '/images/紫藤绣球.jpg', period: 'early', title: '紫藤绣球', year: '1905-1910' },
      { id: 6, url: '/images/春花.jpg', period: 'early', title: '春花', year: '1910-1915' },
      // 右墙展品（按创作时间顺序）
      { id: 7, url: '/images/山水小品.jpg', period: 'early', title: '山水小品', year: '1915-1920' },
      { id: 8, url: '/images/墨竹.jpg', period: 'early', title: '墨竹', year: '1920-1925' },
      { id: 9, url: '/images/秋山图.jpg', period: 'early', title: '秋山图', year: '1925-1930' }
    ],
    // 介绍面板（分主题介绍）
    intros: [
      {
        name: '白宾虹时期',
        lifespan: '1865-1930',
        title: '早期·疏淡清逸',
        honor: '"白宾虹"时期',
        detail:
          '以疏淡清逸的"白宾虹"面貌著称，宗法新安画派，用笔轻灵、设色淡雅，画面留白多，尚未形成后来浑厚华滋的风格。',
        position: { x: 0, y: 5, z: 20 },
        panelWidth: 8,
        panelHeight: 7
      },
      {
        name: '新安画派影响',
        lifespan: '1870-1890',
        title: '宗法新安',
        honor: '早期学习阶段',
        detail: '早年师从新安画派，学习渐江、查士标等人的画风，以疏淡清逸为主，注重笔墨的干练与清雅。',
        position: { x: -6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '花鸟画探索',
        lifespan: '1890-1910',
        title: '花鸟写生',
        honor: '花鸟画实践',
        detail: '在山水之外，黄宾虹也大量创作花鸟画，以轻灵的笔触和淡雅的设色，表现自然生机。',
        position: { x: 6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '画风转变',
        lifespan: '1910-1930',
        title: '由白入黄',
        honor: '风格转型',
        detail: '随着年岁增长，黄宾虹开始探索更深层次的笔墨表达，为后来的"黄宾虹"风格奠定基础。',
        position: { x: 0, y: 5, z: 60 },
        panelWidth: 8,
        panelHeight: 7
      }
    ],
    // 返回入口
    linkedHalls: ['entrance', 'middle'],
    entranceMarkers: [
      {
        label: '返回入口',
        targetHall: 'entrance',
        position: { x: 0, y: 2, z: 5 }
      },
      {
        label: '进入盛期展厅',
        targetHall: 'middle',
        position: { x: 0, y: 2, z: 75 }
      }
    ]
  },

  // 盛期展厅（黄宾虹）
  {
    id: 'middle',
    name: '盛期展厅',
    type: HallType.MAIN,
    period: PeriodType.MIDDLE,
    description: '黄宾虹时期（1930-1948）- 浑厚华滋',
    // 空间参数（扩大空间以容纳更多展品）
    space: {
      length: 80,
      width: 16,
      height: 12,
      wallThickness: 0.1
    },
    // 材质配置（温润厚重）
    materials: {
      wall: {
        color: 0xfff5e6,
        roughness: 0.6,
        metalness: 0.1
      },
      floor: {
        color: 0xf0e6d2,
        roughness: 0.2,
        metalness: 0.7,
        opacity: 0.9,
        transparent: true
      },
      ceiling: {
        color: 0xfff5e6,
        roughness: 0.8,
        metalness: 0.5
      }
    },
    // 灯光配置（温暖）
    lighting: {
      ambient: {
        color: 0xfffff0,
        intensity: 0.8
      },
      directional: [
        {
          color: 0xfff8e1,
          intensity: 2.5,
          position: { x: -8, y: 4, z: 40 }
        },
        {
          color: 0xfff8e1,
          intensity: 2.5,
          position: { x: 11, y: 4, z: 40 }
        }
      ]
    },
    // 相机初始位置
    camera: {
      position: { x: 0, y: 4, z: 10 },
      target: { x: 0, y: 4, z: 70 }
    },
    // 展品配置（按创作时间顺序）
    paintings: [
      // 左墙展品（按创作时间顺序）
      { id: 10, url: '/images/夜色轻舟.jpg', period: 'middle', title: '夜色轻舟', year: '1930-1935' },
      { id: 11, url: '/images/浅绛山水45.jpg', period: 'middle', title: '浅绛山水', year: '1935-1940' },
      { id: 12, url: '/images/山游归来.jpg', period: 'middle', title: '山游归来', year: '1940-1942' },
      { id: 13, url: '/images/设色山水135.jpg', period: 'middle', title: '设色山水', year: '1942-1944' },
      // 右墙展品（按创作时间顺序）
      { id: 14, url: '/images/惠林写生.jpg', period: 'middle', title: '惠林写生', year: '1944-1946' },
      { id: 15, url: '/images/溪山访友.jpg', period: 'middle', title: '溪山访友', year: '1946-1948' },
      { id: 16, url: '/images/黄山写生.jpg', period: 'middle', title: '黄山写生', year: '1947-1948' },
      { id: 17, url: '/images/江行图.jpg', period: 'middle', title: '江行图', year: '1948' }
    ],
    // 介绍面板（分主题介绍）
    intros: [
      {
        name: '黄宾虹时期',
        lifespan: '1930-1948',
        title: '盛期·浑厚华滋',
        honor: '"黄宾虹"时期',
        detail:
          '由"白"入"黄"，积墨、破墨、渍墨并用，画面趋于苍润浑厚；提出"五笔七墨"说，山水浑厚华滋，形成标志性的"黄宾虹调"。',
        position: { x: 0, y: 5, z: 20 },
        panelWidth: 8,
        panelHeight: 7
      },
      {
        name: '五笔七墨理论',
        lifespan: '1930-1940',
        title: '五笔七墨',
        honor: '理论创新',
        detail:
          '提出"五笔七墨"说：五笔为平、圆、留、重、变；七墨为浓、淡、破、泼、积、焦、宿。这一理论成为中国画的经典学说。',
        position: { x: -6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '黄山写生',
        lifespan: '1935-1948',
        title: '黄山情结',
        honor: '山水画实践',
        detail: '多次登临黄山，以黄山为主题创作大量作品，将黄山雄奇险峻的特点与浑厚华滋的笔墨完美结合。',
        position: { x: 6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '画风成熟',
        lifespan: '1940-1948',
        title: '浑厚华滋',
        honor: '风格成熟',
        detail: '这一时期黄宾虹的山水画完全成熟，笔墨苍润浑厚，画面气象万千，形成了独特的"黄宾虹调"。',
        position: { x: 0, y: 5, z: 60 },
        panelWidth: 8,
        panelHeight: 7
      }
    ],
    // 返回入口
    linkedHalls: ['entrance', 'early', 'late'],
    entranceMarkers: [
      {
        label: '返回入口',
        targetHall: 'entrance',
        position: { x: 0, y: 2, z: 5 }
      },
      {
        label: '前往早期展厅',
        targetHall: 'early',
        position: { x: -5, y: 2, z: 75 }
      },
      {
        label: '进入晚期展厅',
        targetHall: 'late',
        position: { x: 5, y: 2, z: 75 }
      }
    ]
  },

  // 晚期展厅（黑宾虹）
  {
    id: 'late',
    name: '晚期展厅',
    type: HallType.MAIN,
    period: PeriodType.LATE,
    description: '黑宾虹时期（1948-1955）- 黑密厚重',
    // 空间参数（扩大空间以容纳更多展品）
    space: {
      length: 80,
      width: 16,
      height: 12,
      wallThickness: 0.1
    },
    // 材质配置（深邃浑厚）
    materials: {
      wall: {
        color: 0xe8e0d8,
        roughness: 0.7,
        metalness: 0.1
      },
      floor: {
        color: 0xd8d0c8,
        roughness: 0.4,
        metalness: 0.6,
        opacity: 0.9,
        transparent: true
      },
      ceiling: {
        color: 0xe8e0d8,
        roughness: 0.8,
        metalness: 0.5
      }
    },
    // 灯光配置（聚光灯）
    lighting: {
      ambient: {
        color: 0xfffff0,
        intensity: 0.6
      },
      directional: [
        {
          color: 0xfff8e1,
          intensity: 3.0,
          position: { x: -8, y: 4, z: 40 }
        },
        {
          color: 0xfff8e1,
          intensity: 3.0,
          position: { x: 11, y: 4, z: 40 }
        }
      ]
    },
    // 相机初始位置
    camera: {
      position: { x: 0, y: 4, z: 10 },
      target: { x: 0, y: 4, z: 70 }
    },
    // 展品配置（按创作时间顺序）
    paintings: [
      // 左墙展品（按创作时间顺序）
      { id: 20, url: '/images/山水.jpg', period: 'late', title: '山水', year: '1948-1950' },
      { id: 21, url: '/images/清水湾写生.jpg', period: 'late', title: '清水湾写生', year: '1950-1952' },
      { id: 22, url: '/images/浅绛山水108.jpg', period: 'late', title: '浅绛山水', year: '1952-1953' },
      { id: 23, url: '/images/水墨山水92.jpg', period: 'late', title: '水墨山水', year: '1953-1954' },
      // 右墙展品（按创作时间顺序）
      { id: 24, url: '/images/黑山水.jpg', period: 'late', title: '黑山水', year: '1954' },
      { id: 25, url: '/images/宿墨山水.jpg', period: 'late', title: '宿墨山水', year: '1954-1955' },
      { id: 26, url: '/images/焦墨山水.jpg', period: 'late', title: '焦墨山水', year: '1955' },
      { id: 27, url: '/images/绝笔山水.jpg', period: 'late', title: '绝笔山水', year: '1955' }
    ],
    // 介绍面板（分主题介绍）
    intros: [
      {
        name: '黑宾虹时期',
        lifespan: '1948-1955',
        title: '晚期·黑密厚重',
        honor: '"黑宾虹"时期',
        detail:
          '以浓墨、焦墨、宿墨层层积染，画面黑中透亮，所谓"黑团团里墨团团"；用笔更趋自由，形成"浑厚华滋、黑密厚重"的终极风格。',
        position: { x: 0, y: 5, z: 20 },
        panelWidth: 8,
        panelHeight: 7
      },
      {
        name: '积墨技法',
        lifespan: '1948-1952',
        title: '积墨大成',
        honor: '技法巅峰',
        detail: '将积墨技法推向极致，层层叠加，使画面达到前所未有的浑厚程度，墨色丰富而通透。',
        position: { x: -6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '焦墨宿墨',
        lifespan: '1952-1955',
        title: '焦墨宿墨',
        honor: '技法突破',
        detail: '大量运用焦墨和宿墨，创造出独特的笔墨效果，画面既有力量感又不失空灵。',
        position: { x: 6, y: 4, z: 40 },
        panelWidth: 5,
        panelHeight: 6
      },
      {
        name: '艺术升华',
        lifespan: '1955',
        title: '人画合一',
        honor: '艺术巅峰',
        detail: '晚年黄宾虹达到人画合一的境界，每一笔都承载着深厚的文化积淀，成为中国山水画的集大成者。',
        position: { x: 0, y: 5, z: 60 },
        panelWidth: 8,
        panelHeight: 7
      }
    ],
    // 返回入口
    linkedHalls: ['entrance', 'middle'],
    entranceMarkers: [
      {
        label: '返回入口',
        targetHall: 'entrance',
        position: { x: 0, y: 2, z: 5 }
      },
      {
        label: '返回盛期展厅',
        targetHall: 'middle',
        position: { x: 0, y: 2, z: 75 }
      }
    ]
  }
];

/**
 * 根据ID获取展厅配置
 */
export function getHallConfig(hallId) {
  return exhibitionHalls.find((hall) => hall.id === hallId);
}

/**
 * 获取所有展厅列表
 */
export function getAllHalls() {
  return exhibitionHalls;
}

/**
 * 获取入口大厅
 */
export function getEntranceHall() {
  return exhibitionHalls.find((hall) => hall.type === HallType.ENTRANCE);
}
