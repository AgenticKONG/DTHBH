<template>
  <!-- 底部 -->
  <footer class="footer">
    <div class="footer-content">
      <h3>数字黄宾虹艺术博物馆</h3>
      <div class="footer-links">
        <a href="#" class="footer-link">关于我们</a>
        <a href="#" class="footer-link">联系我们</a>
        <a href="#" class="footer-link">隐私政策</a>
        <a href="#" class="footer-link">使用条款</a>
      </div>
      <p class="copyright">&copy; 2025 数字黄宾虹项目. 保留所有权利. 本网站内容仅供学习研究使用.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'HeaderNavbar',
  data() {
    return {
      isMobileMenuOpen: false,
      currentPage: 'view' // 默认激活的页面
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
    }
  },
  mounted() {
    // 初始化时根据URL哈希设置当前页面
    const hash = window.location.hash;
    if (hash.includes('观看')) this.currentPage = 'view';
    if (hash.includes('探索')) this.currentPage = 'explore';

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isMobileMenuOpen = false;
      }
    });
  }
};
</script>

<style scoped>
  /* 底部 */
  .footer {
    background-color: rgba(91, 64, 51, 0.9);
    color: #f8f4e6;
    padding: 40px 20px;
    margin-top: 60px;
    text-align: center;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin: 20px 0;
  }

  .footer-link {
    color: #d2b48c;
    text-decoration: none;
    transition: color 0.3s;
  }

  .footer-link:hover {
    color: #fff;
  }
  /* 响应式样式 */
  @media (max-width: 768px) {
  }
</style>
