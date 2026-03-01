<template>
  <header class="header-ya">
    <!-- Logo 區：回首頁 -->
    <router-link to="/" class="logo-group">
      <i class="fas fa-mountain logo-ya-icon"></i>
      <div class="logo-ya-text">數字黃賓虹</div>
    </router-link>

    <!-- 移動端菜單按鈕 -->
    <div class="mobile-toggle" @click="isMobileOpen = !isMobileOpen">
      <i class="fas" :class="isMobileOpen ? 'fa-times' : 'fa-bars'"></i>
    </div>

    <!-- 核心導航菜單 (SPA 化) -->
    <nav class="nav-links-ya" :class="{ 'mobile-active': isMobileOpen }">
      <router-link to="/gallery" class="nav-link-ya" @click="closeMobile">
        <i class="fas fa-palette"></i> 作品
      </router-link>
      <router-link to="/life-river" class="nav-link-ya" @click="closeMobile">
        <i class="fas fa-history"></i> 生平
      </router-link>
      <router-link to="/friends-network" class="nav-link-ya" @click="closeMobile">
        <i class="fas fa-users"></i> 交遊
      </router-link>
      <router-link to="/3d-exhibition" class="nav-link-ya nav-cta" @click="closeMobile">
        <i class="fas fa-vr-cardboard"></i> 線上展廳
      </router-link>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'HeaderNavbar',
  data() {
    return {
      isMobileOpen: false
    };
  },
  methods: {
    closeMobile() {
      this.isMobileOpen = false;
    }
  }
};
</script>

<style scoped>
.header-ya {
  position: fixed; top: 0; left: 0; width: 100%; height: 60px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 40px; z-index: 2000;
  background: rgba(253, 245, 230, 0.85); /* 宣紙色半透明 */
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(210, 180, 140, 0.3);
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
}

.logo-group {
  display: flex; align-items: center; gap: 12px;
  text-decoration: none;
}

.logo-ya-icon { color: #c0392b; font-size: 22px; }
.logo-ya-text {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 24px; color: #3d2b1f; letter-spacing: 2px;
}

.nav-links-ya { display: flex; gap: 10px; align-items: center; }

.nav-link-ya {
  text-decoration: none;
  color: #8b7d6b;
  font-family: "KaiTi", serif;
  font-size: 16px;
  padding: 6px 18px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex; align-items: center; gap: 8px;
}

.nav-link-ya:hover { color: #c0392b; background: rgba(192, 57, 43, 0.05); }

/* 選中狀態樣式 (Vue Router 自動添加) */
.router-link-active:not(.logo-group) {
  color: #c0392b;
  font-weight: bold;
  background: rgba(192, 57, 43, 0.08);
}

/* 線上展廳強調色 */
.nav-cta {
  border: 1px solid rgba(192, 57, 43, 0.3);
  margin-left: 10px;
}

.mobile-toggle { display: none; font-size: 20px; color: #3d2b1f; cursor: pointer; }

@media (max-width: 768px) {
  .mobile-toggle { display: block; }
  .nav-links-ya {
    position: absolute; top: 60px; left: 0; width: 100%;
    flex-direction: column; background: #fdf5e6;
    padding: 20px; display: none;
    border-bottom: 1px solid #d2b48c;
  }
  .nav-links-ya.mobile-active { display: flex; }
  .nav-link-ya { width: 100%; justify-content: center; }
}
</style>
