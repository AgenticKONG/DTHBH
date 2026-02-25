# 黄宾虹数字艺术展 - 3D展厅Beta版本

<div align="center">

**版本**: v2.0.0  
**开发周期**: 8周（约56个工作日）  
**最后更新**: 2026-02-23

[Vue.js](https://vuejs.org/) | [Three.js](https://threejs.org/) | [GSAP](https://greensock.com/gsap/) | [Pinia](https://pinia.vuejs.org/)

</div>

---

## 📋 项目简介

黄宾虹数字艺术展3D展厅是一个基于Web技术的沉浸式数字艺术展览项目，旨在通过3D可视化技术，生动展示中国著名画家黄宾虹的艺术成就和作品。项目采用现代前端技术栈，提供流畅的3D浏览体验、丰富的交互功能和优质的用户界面。

### 核心特性

- 🎨 **3D虚拟展厅**: 基于Three.js的沉浸式3D浏览体验
- 🖼️ **多展厅展示**: 序厅、早期展厅、盛期展厅、晚期展厅、尾厅
- 🧭 **智能导航**: 自主漫游、展览构成、三维缩略图三种导航模式
- ♿ **无障碍支持**: WCAG 2.1 AA级可访问性标准
- 🎯 **响应式设计**: 支持桌面、平板、移动端
- ⚡ **性能优化**: 懒加载、资源缓存、渐进式渲染

---

## 🛠️ 技术栈

### 前端框架
- **Vue 3.4**: 渐进式JavaScript框架
- **Vue Router 4**: 官方路由管理器
- **Pinia 2**: 状态管理库

### 3D渲染
- **Three.js 0.181**: 3D图形库
- **GSAP 3.13**: 动画库

### 数据可视化
- **D3 7.9**: 数据可视化库
- **Axios 1.6**: HTTP客户端

### 开发工具
- **ESLint 8**: 代码检查工具
- **Prettier**: 代码格式化工具
- **Jest 30**: 单元测试框架
- **@vue/test-utils**: Vue组件测试工具

### 构建工具
- **Vue CLI 5**: 项目脚手架
- **Webpack**: 模块打包器
- **Babel**: JavaScript编译器

---

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── assets/            # 资源文件
│   ├── components/        # Vue组件
│   │   ├── 3d/           # 3D相关组件
│   │   ├── FooterNavbar.vue
│   │   ├── HeaderNavbar.vue
│   │   └── LazyImage.vue
│   ├── config/            # 配置文件
│   ├── plugins/           # Vue插件
│   ├── router/            # 路由配置
│   ├── store/             # 状态管理
│   ├── stores/            # Pinia stores
│   ├── three/             # 3D相关代码
│   │   ├── scenes/       # 场景类
│   │   ├── objects/      # 3D对象
│   │   ├── materials/    # 材质定义
│   │   ├── lights/       # 灯光配置
│   │   └── utils/        # 3D工具函数
│   ├── utils/             # 通用工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── tests/
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── setup.js           # 测试配置
├── docs/                  # 项目文档
│   ├── 开发SubAgent/      # 开发文档
│   ├── UI设计规范.md
│   ├── 内容数据.md
│   ├── 材质光影规范.md
│   ├── 技术实现规范.md
│   ├── 测试规范.md
│   └── 3D展厅详细设计-核心.html
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── jest.config.js         # Jest配置
├── babel.config.js        # Babel配置
├── vue.config.js          # Vue CLI配置
├── package.json           # 项目依赖
└── README.md              # 项目说明

```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 14.0.0
- **npm**: >= 6.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# HTTP模式
npm run serve

# HTTPS模式
npm run serve:https
```

访问 [http://localhost:8080](http://localhost:8080) 查看应用。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 代码检查

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### 运行测试

```bash
# 运行所有测试
npm run test:unit

# 监听模式
npm run test:watch

# CI模式
npm run test:ci
```

---

## 📚 开发指南

### 代码规范

项目遵循严格的代码规范，详见：

- **代码规范**: [docs/开发SubAgent/代码规范.md](docs/开发SubAgent/代码规范.md)
- **代码审查**: [docs/开发SubAgent/代码审查机制.md](docs/开发SubAgent/代码审查机制.md)

### UI设计规范

UI组件开发需遵循以下规范：

- **UI设计规范**: [docs/UI设计规范.md](docs/UI设计规范.md)
- **可访问性**: WCAG 2.1 AA级标准
- **响应式**: 移动端、平板、桌面端适配

### 设计文档

- **核心设计**: [docs/3D展厅详细设计-核心.html](docs/3D展厅详细设计-核心.html)
- **材质光影**: [docs/材质光影规范.md](docs/材质光影规范.md)
- **技术实现**: [docs/技术实现规范.md](docs/技术实现规范.md)
- **测试规范**: [docs/测试规范.md](docs/测试规范.md)

### 开发计划

详见：[docs/开发SubAgent/开发计划-TodoList.md](docs/开发SubAgent/开发计划-TodoList.md)

---

## 🏗️ 架构设计

### 3D场景架构

```
SceneManager (场景管理器)
├── HallScene (展厅场景基类)
│   ├── IntroHall (序厅)
│   ├── EarlyHall (早期展厅)
│   ├── MiddleHall (盛期展厅)
│   ├── LateHall (晚期展厅)
│   └── EndHall (尾厅)
├── MaterialManager (材质管理器)
├── LightManager (灯光管理器)
└── InteractionManager (交互管理器)
```

### 3D对象架构

```
3DObjects
├── PaintingFrame (画框)
├── Wall (墙面)
├── Floor (地面)
├── Ceiling (顶棚)
└── Light (灯光)
```

---

## 🎯 展厅设计

### 展厅布局

| 展厅 | 面积 | 特点 | 作品数量 |
|------|------|------|----------|
| 序厅 | 480m² | S形布局，4个区域 | - |
| 早期展厅 | 1280m² | 疏淡清逸风格 | 8幅 |
| 盛期展厅 | 1280m² | 浑厚华滋风格 | 9幅 |
| 晚期展厅 | 600m² | 黑密厚重风格 | 8幅 |
| 尾厅 | 480m² | 中央纪念区 | - |

### 导航模式

1. **自主漫游模式**: 自由探索展厅，第一人称视角
2. **展览构成模式**: 三栏联动，结构化浏览
3. **三维缩略图模式**: 缩略图快速定位

---

## 📊 测试

### 测试覆盖

- **单元测试**: Jest + @vue/test-utils
- **集成测试**: 端到端场景测试
- **覆盖率目标**: >= 70%

### 测试用例

详见：[docs/开发SubAgent/单元测试用例清单.md](docs/开发SubAgent/单元测试用例清单.md)

---

## 🔒 安全性

- XSS防护：使用Vue模板转义
- CSRF防护：Token验证
- 依赖安全：定期更新依赖包
- 代码审查：严格的代码审查流程

---

## 🚢 部署

### 构建优化

- 代码分割
- 资源压缩
- Tree Shaking
- CDN加速

### 环境变量

```
NODE_ENV=production
VUE_APP_API_BASE_URL=https://api.example.com
```

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

---

## 📝 开发团队

- **开发SubAgent**: 负责项目开发和实施
- **设计SubAgent**: 负责UI/UX设计
- **文本处理SubAgent**: 负责内容创作和文案优化

---

## 📄 许可证

本项目仅供学习交流使用，未经授权不得用于商业用途。

---

## 📞 联系方式

如有问题或建议，请联系开发团队。

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和设计者。

<div align="center">

**黄宾虹数字艺术展3D展厅**  
© 2026 All Rights Reserved.

</div>