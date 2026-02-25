# 黄宾虹数字艺术展3D展厅 - UI设计规范

## 文档信息
- **版本**: v1.0
- **创建日期**: 2026-02-23
- **适用项目**: 黄宾虹数字艺术展3D展厅Beta版本

---

## 一、色彩系统规范

### 1.1 主色调系统

```css
:root {
  /* 品牌色 */
  --color-primary: #ffd700;        /* 金色 - 主色 */
  --color-primary-dark: #c9a000;   /* 深金色 - 悬停 */
  --color-primary-light: #fff4a3;  /* 浅金色 - 背景 */
  
  /* 中性色 */
  --color-bg-dark: #2a1f1a;        /* 深色背景 */
  --color-bg-medium: #3d2f25;      /* 中等背景 */
  --color-bg-light: #4a3728;       /* 浅色背景 */
  
  /* 文字色 */
  --color-text-primary: #ffffff;   /* 主标题 */
  --color-text-secondary: #e8e0d0; /* 副标题 */
  --color-text-body: #d4c4a8;      /* 正文 */
  --color-text-muted: #a89880;     /* 辅助文字 */
  
  /* 功能色 */
  --color-success: #4caf50;        /* 成功 */
  --color-warning: #ff9800;        /* 警告 */
  --color-error: #f44336;          /* 错误 */
  --color-info: #2196f3;           /* 信息 */
  
  /* 透明度 */
  --opacity-overlay: 0.85;         /* 遮罩层 */
  --opacity-disabled: 0.5;         /* 禁用状态 */
}
```

### 1.2 色彩对比度标准

| 文字类型 | 原始颜色 | 对比度 | 优化后颜色 | 对比度 | 说明 |
|---------|---------|--------|-----------|--------|------|
| 主标题 | #f5f0e6 | 6.8:1 | #ffffff | 12:1 | 提升至AAA标准 |
| 副标题 | #8b7355 | 3.2:1 | #c9b896 | 6.8:1 | 达到AA标准 |
| 正文 | #f5f0e6 | 6.8:1 | #e8e0d0 | 8.5:1 | 提升可读性 |
| 辅助文字 | #8b7355 | 3.2:1 | #a89880 | 4.5:1 | 达到AA标准 |

### 1.3 色彩使用场景

- **金色系**：品牌标识、强调元素、激活状态、重要按钮
- **深褐色系**：主背景、容器背景、卡片背景
- **米白色系**：标题文字、正文文字
- **功能色**：状态提示、操作反馈

---

## 二、字体系统规范

### 2.1 字体族

```css
:root {
  /* 字体族 */
  --font-family-primary: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif;
  --font-family-display: 'Noto Serif SC', 'Songti SC', serif;  /* 标题用衬线体 */
}
```

### 2.2 字体大小层级

```css
:root {
  /* 字体大小 */
  --font-size-h1: 36px;
  --font-size-h2: 28px;
  --font-size-h3: 22px;
  --font-size-h4: 18px;
  --font-size-body: 16px;
  --font-size-small: 14px;
  --font-size-caption: 12px;
}
```

### 2.3 字重规范

```css
:root {
  /* 字重 */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 2.4 行高规范

```css
:root {
  /* 行高 */
  --line-height-title: 1.2;
  --line-height-body: 1.6;
  --line-height-caption: 1.4;
}
```

### 2.5 字间距规范

```css
:root {
  /* 字间距 */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.05em;
}
```

### 2.6 字体使用场景

| 字体层级 | 字体大小 | 字重 | 行高 | 使用场景 |
|---------|---------|------|------|---------|
| H1 | 36px | Bold (700) | 1.2 | 展厅标题 |
| H2 | 28px | SemiBold (600) | 1.2 | 章节标题 |
| H3 | 22px | SemiBold (600) | 1.2 | 区域标题 |
| H4 | 18px | Medium (500) | 1.2 | 小节标题 |
| Body | 16px | Regular (400) | 1.6 | 正文 |
| Small | 14px | Regular (400) | 1.6 | 辅助文字 |
| Caption | 12px | Regular (400) | 1.4 | 说明文字 |

---

## 三、间距系统规范

### 3.1 基础间距（8px网格）

```css
:root {
  /* 8px 基础网格系统 */
  --space-xs: 4px;    /* 0.5倍 */
  --space-sm: 8px;    /* 1倍 */
  --space-md: 16px;   /* 2倍 */
  --space-lg: 24px;   /* 3倍 */
  --space-xl: 32px;   /* 4倍 */
  --space-2xl: 48px;  /* 6倍 */
  --space-3xl: 64px;  /* 8倍 */
}
```

### 3.2 特殊间距

```css
:root {
  /* 特殊间距 */
  --space-button-padding: 12px 24px;
  --space-input-padding: 10px 16px;
  --space-card-padding: 20px;
}
```

### 3.3 间距使用场景

| 间距类型 | 数值 | 使用场景 |
|---------|------|---------|
| --space-xs | 4px | 微小间距、图标与文字 |
| --space-sm | 8px | 紧凑间距、标签 |
| --space-md | 16px | 常规间距、卡片内边距 |
| --space-lg | 24px | 宽松间距、章节间距 |
| --space-xl | 32px | 大间距、主要区域 |
| --space-2xl | 48px | 超大间距、分隔区域 |
| --space-3xl | 64px | 页面级间距 |

---

## 四、圆角系统规范

### 4.1 圆角数值

```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

### 4.2 圆角使用场景

| 圆角类型 | 数值 | 使用场景 |
|---------|------|---------|
| --radius-sm | 4px | 小型按钮、输入框 |
| --radius-md | 8px | 中型按钮、卡片 |
| --radius-lg | 12px | 大型按钮、面板 |
| --radius-xl | 16px | 对话框、大型容器 |
| --radius-full | 9999px | 圆形按钮、标签 |

---

## 五、阴影系统规范

### 5.1 阴影数值

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.2);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.25);
  --shadow-glow: 0 0 20px rgba(255, 215, 0, 0.5);  /* 金色发光 */
}
```

### 5.2 阴影使用场景

| 阴影类型 | 数值 | 使用场景 |
|---------|------|---------|
| --shadow-sm | 0 1px 2px | 悬浮状态、轻微 elevation |
| --shadow-md | 0 4px 6px | 卡片、面板 |
| --shadow-lg | 0 10px 25px | 弹窗、对话框 |
| --shadow-xl | 0 20px 40px | 大型容器、模态框 |
| --shadow-glow | 0 0 20px | 金色发光效果、激活状态 |

---

## 六、UI组件规范

### 6.1 导航工具条

**尺寸规范：**
```css
.navbar-height: 40px;
.navbar-padding: 0 20px;
.button-width: 80px;
.button-height: 28px;
```

**样式规范：**
```css
.navbar-background: rgba(42, 31, 26, 0.95);
.navbar-border-radius: 8px;
```

**按钮状态：**
```css
.button-default: #8b7355;
.button-active: #ffd700;
.button-hover: #a89880;
```

**过渡动画：**
```css
.transition-duration: 0.3s;
.transition-easing: ease-out;
```

### 6.2 信息面板

**尺寸规范：**
```css
.panel-width: 320px;
.panel-max-height: 80vh;
.panel-padding: 20px;
```

**样式规范：**
```css
.panel-background: rgba(42, 31, 26, 0.95);
.panel-border: 2px solid #ffd700;
.panel-border-radius: 12px;
.panel-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
```

**标题区域：**
```css
.title-height: 40px;
.title-background: #ffd700;
.title-color: #3d2817;
```

**内容区域：**
```css
.content-padding: 16px 0;
.content-line-height: 1.6;
```

### 6.3 画框交互

**悬停状态：**
```css
.hover-scale: 1.05;
.hover-border-color: #ffd700;
.hover-border-width: 6px;
.hover-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
.hover-transition: 0.15s ease-out;
```

**点击状态：**
```css
.click-scale: 0.98;
.click-border-width: 8px;
.click-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
.click-transition: 0.1s ease-in;
```

**光晕效果：**
```css
.glow-inner: 2px solid rgba(255, 215, 0, 0.6);
.glow-outer: 4px dashed rgba(255, 215, 0, 0.3);
```

---

## 七、交互反馈规范

### 7.1 悬停反馈

**视觉效果：**
- 画框悬停：颜色变化 + 轻微缩放(1.05倍) + 光晕效果
- 按钮悬停：背景色变化 + 轻微上浮(2px)
- 列表项悬停：高亮背景 + 左侧指示条

**悬停延迟：**
```css
.hover-delay: 0.1s;  /* 从0.2秒优化到0.1秒 */
```

### 7.2 点击反馈

**视觉效果：**
- 点击：下沉效果(transform: scale(0.98)) + 波纹效果
- 双击：视觉提示(如闪烁或图标动画)

**点击响应时间：**
```css
.click-response: 100ms;  /* 目标响应时间 */
```

### 7.3 过渡动画规范

**动画时长：**
```css
--duration-short: 0.15s;   /* 短速：微交互 */
--duration-medium: 0.3s;   /* 中速：过渡 */
--duration-long: 0.6s;     /* 长速：大动作 */
--duration-slow: 1.0s;     /* 慢速：特殊效果 */
```

**缓动函数：**
```css
--ease-out: ease-out;           /* 进入场景、展开面板 */
--ease-in-out: ease-in-out;     /* 相机移动、过渡动画 */
--custom-bezier: cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* 自定义效果 */
```

---

## 八、加载体验规范

### 8.1 加载进度指示

**加载阶段设计：**
1. **初始加载(0-20%)**：显示品牌logo和加载进度条
2. **资源加载(20-60%)**：显示加载的文字描述(如"加载展厅模型...")
3. **场景初始化(60-80%)**：显示"初始化场景..."
4. **准备就绪(80-100%)**：显示"即将进入..."并准备进入

**进度条设计：**
```css
.progress-height: 4px;
.progress-bg: #3d2f25;
.progress-color: #ffd700;
.progress-animation: 平滑过渡;
```

### 8.2 渐进式加载

**加载优先级：**
1. 优先加载展厅基础结构和材质
2. 然后加载展品和互动元素
3. 最后加载特效和高保真材质

**用户交互：**
- 用户可以在基础场景中先行浏览
- 显示"正在加载..."提示

### 8.3 加载提示文案

```
"正在加载黄宾虹数字艺术展..."
"加载序厅 - 了解黄宾虹的艺术人生"
"加载早期展厅 - 疏淡清逸的白宾虹时期"
"加载盛期展厅 - 浑厚华滋的黄金时期"
"加载晚期展厅 - 黑密厚重的艺术巅峰"
"加载完成，即将开始您的艺术之旅"
```

---

## 九、无障碍设计规范

### 9.1 键盘导航支持

**全局快捷键：**
- `ESC`: 返回上一级/关闭当前视图
- `空格`: 暂停/继续(用于视频或动画)
- `+/-`: 放大/缩小
- `←/→`: 前进/后退(在展览构成模式)
- `↑/↓`: 上一个/下一个作品
- `H`: 显示帮助信息
- `M`: 静音/取消静音
- `F`: 全屏切换

**画框交互快捷键：**
- `Tab`: 在画框之间循环切换
- `Enter/Space`: 选中当前画框
- `方向键`: 移动选区
- `1-9`: 快速跳转到第N幅作品

**焦点管理：**
- 焦点样式: 2px金色边框(#ffd700)
- 焦点移动顺序符合阅读习惯
- 防止焦点陷阱

### 9.2 屏幕阅读器支持

**ARIA标签规范：**
```html
<!-- 展厅容器 -->
<div role="region" aria-label="早期展厅" aria-describedby="early-hall-desc">
  <p id="early-hall-desc" class="sr-only">
    早期展厅,展示黄宾虹1865年至1930年间的艺术作品,共8幅作品,包括山水画和花鸟画
  </p>
  
  <!-- 画框 -->
  <div role="button" 
       tabindex="0" 
       aria-label="春山红树,1880年创作,山水画"
       aria-describedby="artwork-1-desc">
    <p id="artwork-1-desc" class="sr-only">
      点击查看作品详细信息,双击定位到作品位置
    </p>
  </div>
</div>
```

**语义化结构：**
- 使用 `<nav>` 标记导航工具条
- 使用 `<main>` 标记主要3D场景
- 使用 `<aside>` 标记信息面板
- 使用 `<article>` 标记作品卡片

**动态内容提示：**
- 当前位置: "您现在位于早期展厅"
- 导航状态: "进入展览构成模式"
- 加载状态: "加载中,已完成60%"

### 9.3 色盲友好的视觉设计

**双重信息编码：**
- 除颜色外,使用图标、文字、形状等多种方式传递信息
- 当前展厅用金色高亮,同时显示"当前展厅"文字标签
- 作品列表中的已浏览状态: 颜色变化 + 对钩图标

**色彩可访问性：**
- 避免仅使用红色/绿色传达信息
- 检查配色方案对色盲用户的可识别性
- 提供高对比度模式选项

---

## 十、响应式设计规范

### 10.1 断点系统

```css
--breakpoint-xs: 0px;      /* 超小屏 */
--breakpoint-sm: 576px;    /* 小屏 */
--breakpoint-md: 768px;    /* 中屏 */
--breakpoint-lg: 992px;    /* 大屏 */
--breakpoint-xl: 1200px;   /* 超大屏 */
--breakpoint-xxl: 1400px;  /* 超超大屏 */
```

### 10.2 响应式策略

**移动优先：**
- 默认使用移动端布局
- 使用媒体查询逐步增加功能

**断点适配：**
- `sm`: 调整字体大小和间距
- `md`: 启用多列布局
- `lg`: 优化桌面端体验
- `xl`: 启用高级功能

---

## 十一、组件样式示例

### 11.1 按钮样式

```css
/* 主按钮 */
.btn-primary {
  background: #ffd700;
  color: #3d2817;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease-out;
}

.btn-primary:hover {
  background: #c9a000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}
```

### 11.2 卡片样式

```css
.card {
  background: rgba(61, 47, 37, 0.95);
  border: 1px solid #4a3728;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-out;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}
```

### 11.3 输入框样式

```css
.input {
  background: rgba(74, 55, 40, 0.5);
  border: 1px solid #8b7355;
  border-radius: 8px;
  padding: 10px 16px;
  color: #f5f0e6;
  font-size: 16px;
  transition: all 0.3s ease-out;
}

.input:focus {
  border-color: #ffd700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
  outline: none;
}
```

---

## 十二、设计原则

1. **一致性**: 所有UI元素遵循统一的视觉规范
2. **可访问性**: 符合WCAG 2.1 Level AA标准
3. **性能优先**: 动画和交互效果不影响性能
4. **响应式**: 适配各种设备和屏幕尺寸
5. **用户友好**: 直观、易用、反馈及时

---

**文档版本**: v1.0  
**最后更新**: 2026-02-23  
**维护者**: 设计团队