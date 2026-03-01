<template>
  <div class="home-page-ya">
    <!-- 主內容區 -->
    <main class="main-content-ya">
      
      <!-- 英雄區 (Hero Section) -->
      <section class="hero-ya">
        <div class="portrait-box">
          <img src="/images/huangbinhong.jpg" alt="黃賓虹肖像" class="artist-img" />
          <div class="lifespan-stamp">1865 - 1955</div>
        </div>
        
        <h1 class="artist-name-ya">黃賓虹</h1>
        <p class="artist-bio-ya">
          中國近現代國畫大師、書法家、藝術教育家<br/>
          山水畫「黑密厚重、渾厚華滋」一代宗師
        </p>
        
        <div class="quote-box-ya">
          <span class="quote-marks">“</span>
          中華大地，無山不美，無水不秀。
          <span class="quote-marks">”</span>
        </div>
      </section>

      <!-- 四大核心入口 (Modules Grid) -->
      <section class="modules-grid-ya">
        <!-- 1. 作品 -->
        <router-link to="/gallery" class="module-card">
          <div class="card-icon"><i class="fas fa-palette"></i></div>
          <h3 class="card-title">作品畫廊</h3>
          <p class="card-desc">金石入畫，五筆七墨<br/>探索賓翁筆墨乾坤</p>
          <div class="card-btn">進入 <i class="fas fa-arrow-right"></i></div>
        </router-link>

        <!-- 2. 生平 -->
        <router-link to="/life-river" class="module-card card-accent">
          <div class="card-icon"><i class="fas fa-history"></i></div>
          <h3 class="card-title">生平大河</h3>
          <p class="card-desc">九一載編年敘事<br/>與時代背景精準對齊</p>
          <div class="card-btn">研讀 <i class="fas fa-arrow-right"></i></div>
        </router-link>

        <!-- 3. 交遊 -->
        <router-link to="/friends-network" class="module-card">
          <div class="card-icon"><i class="fas fa-users"></i></div>
          <h3 class="card-title">交遊網絡</h3>
          <p class="card-desc">墨海星圖，知音長卷<br/>還原一代藝術生態圈</p>
          <div class="card-btn">尋訪 <i class="fas fa-arrow-right"></i></div>
        </router-link>

        <!-- 4. 線上展廳 -->
        <router-link to="/3d-exhibition" class="module-card card-highlight">
          <div class="card-icon"><i class="fas fa-vr-cardboard"></i></div>
          <h3 class="card-title">線上展廳</h3>
          <p class="card-desc">沉浸式 3D 空間<br/>身臨其境品味大師真蹟</p>
          <div class="card-btn">開啟 <i class="fas fa-arrow-right"></i></div>
        </router-link>
      </section>

    </main>
    
    <!-- 頁腳 -->
    <footer class="footer-ya">
      <p>數字黃賓虹項目 © 2026 | 基於學術研究的藝術數字化實踐</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted() {
    // 進入頁面時平滑滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
</script>

<style scoped>
.home-page-ya {
  min-height: 100vh;
  background-color: #fdf5e6;
  background-image: 
    linear-gradient(rgba(253, 245, 230, 0.8), rgba(253, 245, 230, 0.8)),
    url('../assets/qiushan.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  color: #3d2b1f;
  font-family: "SimSun", serif;
  display: flex;
  flex-direction: column;
}

.main-content-ya {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px 60px;
  width: 100%;
}

/* 英雄區樣式 */
.hero-ya {
  text-align: center;
  margin-bottom: 80px;
}

.portrait-box {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
}

.artist-img {
  width: 160px; height: 160px;
  border-radius: 50%;
  border: 6px solid #d2b48c;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  filter: sepia(0.2);
}

.lifespan-stamp {
  position: absolute; bottom: -10px; right: -20px;
  background: #c0392b; color: #fff;
  padding: 4px 12px; font-weight: bold;
  font-family: "Georgia", serif;
  transform: rotate(-5deg);
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
}

.artist-name-ya {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 64px; margin-bottom: 10px;
  color: #3d2b1f; text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
}

.artist-bio-ya {
  font-family: "KaiTi", serif;
  font-size: 20px; color: #8b7d6b;
  line-height: 1.6; margin-bottom: 40px;
}

.quote-box-ya {
  font-family: "KaiTi", serif;
  font-size: 24px; font-style: italic;
  color: #5c4033; opacity: 0.9;
  display: flex; align-items: center; justify-content: center; gap: 15px;
}

.quote-marks { font-size: 48px; color: #d2b48c; font-family: "Georgia", serif; line-height: 0; }

/* 入口卡片網格 */
.modules-grid-ya {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 25px;
}

.module-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid #d2b48c;
  padding: 35px 25px;
  text-decoration: none;
  color: inherit;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  border-radius: 4px;
}

.module-card:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(139, 69, 19, 0.15);
  border-color: #c0392b;
}

.card-icon { font-size: 32px; color: #d2b48c; margin-bottom: 20px; transition: color 0.3s; }
.module-card:hover .card-icon { color: #c0392b; }

.card-title {
  font-family: "KaiTi", serif;
  font-size: 22px; font-weight: bold;
  margin-bottom: 15px; color: #3d2b1f;
}

.card-desc {
  font-size: 14px; color: #8b7d6b;
  line-height: 1.8; margin-bottom: 25px;
}

.card-btn {
  font-size: 13px; font-weight: bold; color: #8b7d6b;
  text-transform: uppercase; letter-spacing: 1px;
}
.module-card:hover .card-btn { color: #c0392b; }

.footer-ya {
  padding: 40px 20px; text-align: center;
  border-top: 1px solid rgba(210, 180, 140, 0.2);
  font-size: 13px; color: #b8a48c;
}

@media (max-width: 768px) {
  .artist-name-ya { font-size: 48px; }
  .modules-grid-ya { grid-template-columns: 1fr; }
}
</style>
