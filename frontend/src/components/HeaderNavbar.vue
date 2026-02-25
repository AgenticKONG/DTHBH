<template>
  <header class="header">
    <a href="/" class="logo">
      <i class="fas fa-mountain logo-icon"></i>
      <div class="logo-text">数字黄宾虹</div>
    </a>

    <div class="mobile-menu-btn" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i>
    </div>

    <nav class="nav-menu" :class="{ active: isMobileMenuOpen }">
      <a
        href="/gallery"
        class="nav-item"
        :class="{ active: currentPage === 'gallery' }"
        @click="handleNavClick('gallery')"
      >
        <i class="fas fa-eye"></i> 作品集
      </a>
      <a
        href="/3d-exhibition"
        class="nav-item"
        :class="{ active: currentPage === 'exhibition' }"
        @click="handleNavClick('exhibition')"
      >
        <i class="fas fa-compass"></i> 3D走廊
      </a>
      <a
        href="/friends-network"
        class="nav-item"
        :class="{ active: currentPage === 'friends' }"
        @click="handleNavClick('friends')"
      >
        <i class="fas fa-users"></i> 交游
      </a>
      <a
        href="/art-footprints"
        class="nav-item"
        :class="{ active: currentPage === 'footprints' }"
        @click="handleNavClick('footprints')"
      >
        <i class="fas fa-shoe-prints"></i> 生平
      </a>
      <a href="/map" class="nav-item" :class="{ active: currentPage === 'about' }" @click="handleNavClick('about')">
        <i class="fas fa-book"></i> 地图
      </a>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'HeaderNavbar',
  data() {
    return {
      isMobileMenuOpen: false,
      currentPage: 'home' // 默认激活的页面
    };
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    handleNavClick(page) {
      // 更新当前激活状态
      this.currentPage = page;

        // 移动端点击后关闭菜单
      if (window.innerWidth <= 768) {
        this.isMobileMenuOpen = false;
      }
    },
    updateCurrentPageFromPath() {
      const path = window.location.pathname;

        if (path.includes('gallery')) this.currentPage = 'gallery';
      else if (path.includes('3d-exhibition')) this.currentPage = 'exhibition';
      else if (path.includes('friends-network')) this.currentPage = 'friends';
      else if (path.includes('art-footprints')) this.currentPage = 'footprints';
      else if (path.includes('about')) this.currentPage = 'about';
      else this.currentPage = 'home'; // 默认值
    }
  },
  mounted() {
    // 初始化时根据URL路径设置当前页面
    this.updateCurrentPageFromPath();

    // 监听路由变化（如果使用Vue Router）
    if (this.$route) {
      this.$watch(
        () => this.$route.path,
        () => {
          this.updateCurrentPageFromPath();
        }
      );
    }

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isMobileMenuOpen = false;
      }
    });
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
  .header {
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    background-color: rgba(91, 64, 51, 0.95);
    backdrop-filter: blur(10px);
    font-family:
      'SimSun',
      'STSong',
      'KaiTi',
      'STKaiti',
      Georgia,
      Times New Roman,
      serif;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 15px;
    text-decoration: none;
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.05);
  }

  .logo-icon {
    color: #d2b48c;
    font-size: 28px;
  }

  .logo-text {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .nav-menu {
    display: flex;
    gap: 20px;
  }

  .nav-item {
    color: #f8f4e6;
    text-decoration: none;
    font-size: 16px;
    padding: 8px 20px;
    border-radius: 25px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }

  .nav-item:hover {
    background-color: rgba(210, 180, 140, 0.3);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(210, 180, 140, 0.2);
  }

  .nav-item.active {
    background-color: #d2b48c;
    color: #5c4033;
    font-weight: 600;
  }

  .mobile-menu-btn {
    display: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .mobile-menu-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  /* 响应式样式 */
  @media (max-width: 768px) {
    .header {
      padding: 15px 20px;
    }

    .nav-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: rgba(139, 69, 19, 0.98);
      flex-direction: column;
      padding: 20px;
      gap: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .nav-menu.active {
      display: flex;
    }

    .nav-item {
      padding: 12px 20px;
      border-radius: 10px;
      justify-content: center;
    }

    .mobile-menu-btn {
      display: block;
    }

    .logo-text {
      font-size: 20px;
    }
  }
</style>
