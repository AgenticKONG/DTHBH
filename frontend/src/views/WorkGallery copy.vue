<template>
  <body>
    <header>
      <HeaderNavbar />
    </header>
    <main class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">黄宾虹作品集</h1>
        <p class="page-subtitle">浏览黄宾虹的艺术作品，按时期、题材分类，全面了解大师的艺术创作历程</p>
      </div>

      <!-- 统计信息 -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value" id="totalWorks">0</div>
          <div class="stat-label">总作品数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="earlyWorks">0</div>
          <div class="stat-label">早期作品</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="middleWorks">0</div>
          <div class="stat-label">中期作品</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="lateWorks">0</div>
          <div class="stat-label">晚期作品</div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">时期：</span>
          <select class="filter-select" id="periodFilter">
            <option value="all">全部时期</option>
            <option value="early">早期（1865-1900）</option>
            <option value="middle">中期（1901-1930）</option>
            <option value="late">晚期（1931-1955）</option>
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-label">题材：</span>
          <select class="filter-select" id="subjectFilter">
            <option value="all">全部题材</option>
            <option value="landscape">山水</option>
            <option value="calligraphy">书法</option>
            <option value="flower">花鸟</option>
            <option value="figure">人物</option>
          </select>
        </div>

        <div class="search-box">
          <input type="text" class="search-input" id="searchInput" placeholder="搜索作品名称或描述..." />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- 作品网格 -->
      <div class="gallery-grid" id="galleryGrid">
        <!-- 作品将通过JavaScript动态加载 -->
      </div>

      <!-- 加载更多 -->
      <div class="load-more" id="loadMoreSection">
        <button class="load-more-btn" id="loadMoreBtn">
          <i class="fas fa-spinner fa-spin" style="display: none"></i>
          <span>加载更多作品</span>
        </button>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" id="emptyState" style="display: none">
        <div class="empty-icon">
          <i class="fas fa-palette"></i>
        </div>
        <h3>未找到符合条件的作品</h3>
        <p>请尝试调整筛选条件或搜索关键词</p>
      </div>

      <!-- 分页 -->
      <div class="pagination" id="pagination" style="display: none">
        <button class="page-btn" id="prevPageBtn" disabled>
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="page-numbers" id="pageNumbers"></div>
        <button class="page-btn" id="nextPageBtn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>
  </body>
</template>

<script>
  import HeaderNavbar from '../components/HeaderNavbar.vue';

  export default {
    name: 'GalleryPage',
    components: { HeaderNavbar },
    data() {
      return {
        selectedPeriod: '',
        selectedType: '',
        searchKeyword: '',
        currentPage: 1,
        itemsPerPage: 6,
        works: [
          {
            id: 1,
            title: '黄山汤口',
            year: '1955年',
            type: 'landscape',
            period: 'late',
            thumbnail: '/images/hbh1.jpg',
            tags: []
          },
          {
            id: 2,
            title: '青山绿水',
            year: '1953年',
            type: 'landscape',
            period: 'late',
            thumbnail: '/images/hbh2.jpg',
            tags: []
          },
          {
            id: 3,
            title: '墨荷图',
            year: '1948年',
            type: 'flower',
            period: 'middle',
            thumbnail: '/images/hbh1.jpg',
            tags: []
          },
          {
            id: 4,
            title: '行书诗轴',
            year: '1950年',
            type: 'calligraphy',
            period: 'late',
            thumbnail: '/images/hbh1.jpg',
            tags: []
          }
        ],
        // filteredWorks : [],
        currentSort: 'year-desc'
      };
    },
    computed: {
      filteredWorks() {
        return this.works.filter((work) => {
          const matchesPeriod = !this.selectedPeriod || work.period === this.selectedPeriod;
          const matchesType = !this.selectedType || work.type === this.selectedType;
          const matchesSearch = !this.searchKeyword || work.title.includes(this.searchKeyword);
          return matchesPeriod && matchesType && matchesSearch;
        });
      }
    },
    mounted() {
      const self = this;
      // 页面初始化
      document.addEventListener('DOMContentLoaded', function () {
      // 移动端菜单切换
      // const mobileMenuBtn = document.getElementById('mobileMenuBtn');
      // const navMenu = document.getElementById('navMenu');

      // mobileMenuBtn.addEventListener('click', function() {
      //     navMenu.classList.toggle('active');
      // });

      // 筛选器事件
      const periodFilter = document.getElementById('periodFilter');
      const subjectFilter = document.getElementById('subjectFilter');
      const searchInput = document.getElementById('searchInput');

      [periodFilter, subjectFilter].forEach((filter) => {
        filter.addEventListener('change', function() {
          self.filterArtworks();
          self.renderGallery();
          self.updateStats();
        });
      });
      const debouncedSearch = self.debounce(function () {
        self.handleSearch();
      }, 300);
        // 搜索功能
      searchInput.addEventListener('input', debouncedSearch);

      // 加载更多
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      loadMoreBtn.addEventListener('click', self.loadMoreArtworks);

      // 分页按钮
      const prevPageBtn = document.getElementById('prevPageBtn');
      const nextPageBtn = document.getElementById('nextPageBtn');

      prevPageBtn.addEventListener('click', function () {
        if (self.currentPage > 1) {
          self.currentPage--;
          self.renderGallery();
          self.updatePagination();
        }
      });

      nextPageBtn.addEventListener('click', function () {
        const totalPages = Math.ceil(self.filteredWorks.length / self.itemsPerPage);
        if (self.currentPage < totalPages) {
          self.currentPage++;
          self.renderGallery();
          self.updatePagination();
        }
      });

      // 初始渲染
      self.filterArtworks();
      self.renderGallery();
      self.updateStats();
      self.updatePagination();

      // 连接到系统
      if (window.HuangBinHongSystem) {
        window.HuangBinHongSystem.currentModule = 'gallery';

        // 发送页面就绪消息
        window.HuangBinHongSystem.messageChannel.postMessage({
          type: 'PAGE_READY',
          page: 'gallery',
          timestamp: new Date().toISOString()
        });
      }

      // 键盘快捷键
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          // 返回首页
          if (window.HuangBinHongSystem) {
            window.HuangBinHongSystem.navigateTo('home');
          } else {
            window.location.href = 'index.html';
          }
        }

        if (e.key === '/' || e.key === 's') {
          // 聚焦搜索框
          e.preventDefault();
          searchInput.focus();
        }

        if (e.key === 'ArrowLeft' && e.ctrlKey) {
          // 上一页
          if (self.currentPage > 1) {
            self.currentPage--;
            self.renderGallery();
            self.updatePagination();
          }
        }

        if (e.key === 'ArrowRight' && e.ctrlKey) {
          // 下一页
          const totalPages = Math.ceil(self.filteredWorks.length / self.itemsPerPage);
          if (self.currentPage < totalPages) {
            self.currentPage++;
            self.renderGallery();
            self.updatePagination();
          }
        }
      });
      });
    },
    methods: {
      // 防抖函数
      debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
      },
    // 排序作品
    sortArtworks() {
      switch (this.currentSort) {
      case 'year-desc':
        this.filteredWorks.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        this.filteredWorks.sort((a, b) => a.year - b.year);
        break;
      case 'importance-desc':
        this.filteredWorks.sort((a, b) => b.importance - a.importance);
        break;
      }
      },
      // 筛选作品
    filterArtworks() {
      const periodFilter = document.getElementById('periodFilter').value;
      const subjectFilter = document.getElementById('subjectFilter').value;
      const searchInput = document.getElementById('searchInput').value.toLowerCase();

      self.filteredWorks = this.works.filter((artwork) => {
        // 时期筛选
        if (periodFilter !== 'all' && artwork.period !== periodFilter) {
          return false;
        }

        // 题材筛选
        if (subjectFilter !== 'all' && artwork.subject !== subjectFilter) {
          return false;
        }


        // 搜索筛选
        if (searchInput) {
          const searchText = searchInput.toLowerCase();
          const titleMatch = artwork.title.toLowerCase().includes(searchText);
          const descMatch = artwork.description.toLowerCase().includes(searchText);
          const tagsMatch = artwork.tags.some(tag => tag.toLowerCase().includes(searchText));

          if (!titleMatch && !descMatch && !tagsMatch) {
            return false;
          }
        }

        return true;
      });

      // 排序
      this.sortArtworks();

      // 重置页码
      self.currentPage = 1;
      },



    // 渲染画廊
    renderGallery() {
      const self = this;
      const galleryGrid = document.getElementById('galleryGrid');
      const emptyState = document.getElementById('emptyState');
      const loadMoreSection = document.getElementById('loadMoreSection');
      const pagination = document.getElementById('pagination');
      // 检查是否有作品
      if (this.filteredWorks.length === 0) {
        galleryGrid.innerHTML = '';
        emptyState.style.display = 'block';
        loadMoreSection.style.display = 'none';
        pagination.style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';
      // 计算分页
      const startIndex = (self.currentPage - 1) * self.itemsPerPage;
      const endIndex = Math.min(startIndex + self.itemsPerPage, this.filteredWorks.length);
      const pageArtworks = this.filteredWorks.slice(startIndex, endIndex);
      // 清空网格
      galleryGrid.innerHTML = '';
      // 渲染作品卡片
      pageArtworks.forEach((artwork) => {
        const card = self.createArtworkCard(artwork);
        galleryGrid.appendChild(card);
      });

      // 显示/隐藏加载更多和分页
      const totalPages = Math.ceil(this.filteredWorks.length / self.itemsPerPage);
      if (totalPages > 1) {
        pagination.style.display = 'flex';
        loadMoreSection.style.display = 'none';
      } else {
        pagination.style.display = 'none';
        loadMoreSection.style.display = this.filteredWorks.length > self.itemsPerPage ? 'block' : 'none';
      }
      },


    // 创建作品卡片
    createArtworkCard(artwork) {
      const card = document.createElement('div');
      card.className = 'artwork-card';
      console.log('创建作品卡片', artwork);
      // 生成标签HTML
      const tagsHTML = artwork.tags.map((tag) => `<span class="artwork-tag">${tag}</span>`).join('');


      card.innerHTML = `
            <img src="${artwork.thumbnail}" alt="${artwork.title}" class="artwork-image">
            <div class="artwork-info">
                <h3 class="artwork-title">${artwork.title}</h3>
                <div class="artwork-meta">${artwork.year}年 · ${artwork.size} · ${artwork.collection}</div>
                <div class="artwork-description">${artwork.description}</div>
                <div class="artwork-tags">
                    ${tagsHTML}
                </div>
                <div class="artwork-actions">
                    <button class="action-btn view-detail-btn" data-id="${artwork.id}">
                        <i class="fas fa-eye"></i> 查看详情
                    </button>
                </div>
            </div>
        `;

      // 添加点击事件
      const viewDetailBtn = card.querySelector('.view-detail-btn');
      viewDetailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        self.viewArtworkDetail(artwork.id);
      });


      // 卡片整体点击
      card.addEventListener('click', () => {
        self.viewArtworkDetail(artwork.id);
      });

      return card;
      },


    // 查看作品详情
    viewArtworkDetail(artworkId) {
      const artwork = self.artworksData.find((a) => a.id === artworkId);
      if (artwork) {
        if (window.HuangBinHongSystem) {
          window.HuangBinHongSystem.navigateTo('detailed-work', {
            artwork: artworkId,
            from: 'gallery'
          });
        } else {
          // 跳转到详细页面
          window.location.href = `detailed-work.html?id=${artworkId}`;
        }

        // 记录用户查看
        if (window.HuangBinHongSystem) {
          window.HuangBinHongSystem.addNote('gallery', `查看了作品: ${artwork.title}`);
        }
      }
      },

    // 加载更多作品
    loadMoreArtworks() {
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      const spinner = loadMoreBtn.querySelector('.fa-spinner');
      const textSpan = loadMoreBtn.querySelector('span');

      // 显示加载中
      textSpan.textContent = '加载中...';
      spinner.style.display = 'inline-block';
      loadMoreBtn.disabled = true;

      // 模拟加载延迟
      setTimeout(() => {
        // 增加每页显示数量
        self.itemsPerPage += 6;

        // 重新渲染
        self.renderGallery();
        self.updatePagination();

        // 恢复按钮状态
        textSpan.textContent = '加载更多作品';
        spinner.style.display = 'none';
        loadMoreBtn.disabled = false;

        // 如果已经显示所有作品，隐藏加载更多按钮
        if (self.filteredWorks.length <= self.itemsPerPage) {
          loadMoreBtn.style.display = 'none';
        }
      }, 1000);
      },

    // 更新统计信息
    updateStats() {
      const totalWorks = this.filteredWorks.length;
      const earlyWorks = this.filteredWorks.filter((a) => a.period === 'early').length;
      const middleWorks = this.filteredWorks.filter((a) => a.period === 'middle').length;
      const lateWorks = this.filteredWorks.filter((a) => a.period === 'late').length;

      document.getElementById('totalWorks').textContent = totalWorks;
      document.getElementById('earlyWorks').textContent = earlyWorks;
      document.getElementById('middleWorks').textContent = middleWorks;
      document.getElementById('lateWorks').textContent = lateWorks;
      },

    // 更新分页
    updatePagination() {
      const totalPages = Math.ceil(this.filteredWorks.length / self.itemsPerPage);
      const prevPageBtn = document.getElementById('prevPageBtn');
      const nextPageBtn = document.getElementById('nextPageBtn');
      const pageNumbers = document.getElementById('pageNumbers');

      // 更新按钮状态
      prevPageBtn.disabled = self.currentPage === 1;
      nextPageBtn.disabled = self.currentPage === totalPages;

      // 生成页码
      pageNumbers.innerHTML = '';

      // 显示页码范围
      let startPage = Math.max(1, self.currentPage - 2);
      let endPage = Math.min(totalPages, self.currentPage + 2);

      // 确保显示5个页码
      if (endPage - startPage < 4) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, endPage - 4);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        if (i === self.currentPage) {
          pageNumber.classList.add('active');
        }
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', function() {
          self.currentPage = i;
          self.renderGallery();
          self.updatePagination();
        });
        pageNumbers.appendChild(pageNumber);
      }
      }

  };
</script>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    color: #333;
    background: linear-gradient(135deg, #f5f0e6 0%, #e8dfca 100%);
    min-height: 100vh;
    font-family:
      'SimSun',
      'STSong',
      'KaiTi',
      'STKaiti',
      Georgia,
      Times New Roman,
      serif;
  }

  /* 统一导航栏 */
  .header {
    background-color: rgba(139, 69, 19, 0.95);
    backdrop-filter: blur(10px);
    padding: 15px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
  }

  .mobile-menu-btn {
    display: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
  }

  /* 主内容区 */
  .main-content {
    padding-top: 100px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    font-family:
      'SimSun',
      'STSong',
      'KaiTi',
      'STKaiti',
      Georgia,
      Times New Roman,
      serif;
  }

  /* 页面标题 */
  .page-header {
    text-align: center;
    padding: 30px 20px;
    /* padding: 0%; */
    background-color: rgba(255, 251, 240, 0.9);
    border-radius: 15px;
    margin-bottom: 30px;
    /* margin: 0; */
    border: 1px solid rgba(210, 180, 140, 0.3);
  }

  .page-title {
    color: #8b4513;
    font-size: 36px;
    margin-bottom: 10px;
  }

  .page-subtitle {
    color: #5c4033;
    font-size: 18px;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* 筛选栏 */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 30px;
    padding: 20px;
    background-color: rgba(255, 251, 240, 0.9);
    border-radius: 10px;
    border: 1px solid rgba(210, 180, 140, 0.3);
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-label {
    color: #5c4033;
    font-weight: bold;
    white-space: nowrap;
  }

  .filter-select {
    padding: 8px 15px;
    border: 1px solid #d2b48c;
    border-radius: 5px;
    background-color: #fffbf0;
    color: #333;
    font-family: inherit;
    font-size: 14px;
    min-width: 150px;
  }

  .search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 8px 40px 8px 15px;
    border: 1px solid #d2b48c;
    border-radius: 5px;
    background-color: #fffbf0;
    color: #333;
    font-family: inherit;
  }

  .search-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #8b4513;
  }

  /* 作品网格 */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
  }

  .artwork-card {
    background-color: rgba(255, 251, 240, 0.9);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(210, 180, 140, 0.3);
    transition: all 0.3s;
    cursor: pointer;
  }

  .artwork-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .artwork-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-bottom: 3px solid #d2b48c;
  }

  .artwork-info {
    padding: 20px;
  }

  .artwork-title {
    color: #8b4513;
    font-size: 18px;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .artwork-meta {
    color: #666;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .artwork-description {
    color: #333;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 15px;
    height: 60px;
    overflow: hidden;
  }

  .artwork-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 15px;
  }

  .artwork-tag {
    background-color: #f0e6d6;
    border: 1px solid #d2b48c;
    border-radius: 12px;
    padding: 3px 8px;
    font-size: 11px;
    color: #5c4033;
  }

  .artwork-actions {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d2b48c;
    background-color: #f8f4e6;
    border-radius: 5px;
    color: #5c4033;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .action-btn:hover {
    background-color: #d2b48c;
    color: #333;
  }

  /* 分页 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
  }

  .page-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #d2b48c;
    background-color: #f8f4e6;
    border-radius: 5px;
    color: #5c4033;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .page-btn:hover:not(.disabled) {
    background-color: #d2b48c;
    color: #333;
  }

  .page-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .page-numbers {
    display: flex;
    gap: 5px;
  }

  .page-number {
    width: 40px;
    height: 40px;
    border: 1px solid #d2b48c;
    background-color: #f8f4e6;
    border-radius: 5px;
    color: #5c4033;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .page-number:hover {
    background-color: #d2b48c;
    color: #333;
  }

  .page-number.active {
    background-color: #8b4513;
    color: #fff;
    border-color: #8b4513;
  }

  /* 统计信息 */
  .stats-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: rgba(248, 244, 230, 0.9);
    border-radius: 10px;
    margin-bottom: 20px;
    border: 1px solid rgba(210, 180, 140, 0.3);
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 5px;
  }

  .stat-label {
    font-size: 14px;
    color: #5c4033;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .header {
      padding: 15px 20px;
    }

    .nav-menu {
      display: none;
      position: absolute;
      top: 70px;
      left: 0;
      width: 100%;
      background-color: rgba(139, 69, 19, 0.98);
      flex-direction: column;
      padding: 20px;
      gap: 15px;
    }

    .nav-menu.active {
      display: flex;
    }

    .mobile-menu-btn {
      display: block;
    }

    .page-title {
      font-size: 28px;
    }

    .filter-bar {
      flex-direction: column;
    }

    .gallery-grid {
      grid-template-columns: 1fr;
    }

    .stats-bar {
      flex-direction: column;
      gap: 15px;
      text-align: center;
    }
  }

  /* 加载更多 */
  .load-more {
    text-align: center;
    margin: 30px 0;
  }

  .load-more-btn {
    padding: 12px 40px;
    background-color: #d2b48c;
    border: none;
    border-radius: 5px;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    font-size: 16px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .load-more-btn:hover {
    background-color: #a67c52;
    color: #fff;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .empty-icon {
    font-size: 60px;
    color: #d2b48c;
    margin-bottom: 20px;
  }
</style>
