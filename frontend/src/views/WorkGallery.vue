<template>
  <body>
    <header><HeaderNavbar /></header>

    <main class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">黄宾虹作品集</h1>
        <p class="page-subtitle">按艺术时期、技法风格分类浏览黄宾虹大师的艺术作品，全面了解其艺术创作历程</p>
      </div>

      <!-- ① 分类导航 -->
      <div class="sub-nav-wrap">
        <div class="sub-nav">
          <button
            v-for="cat in categories"
            :key="cat.val"
            class="sub-nav-btn"
            :class="{ active: selectedCategory === cat.val }"
            @click="changeCategory(cat.val)"
          >
            {{ cat.label }}
            <span class="count">({{ getCategoryCount(cat.val) }})</span>
          </button>
        </div>
      </div>

      <!-- ② 高级筛选器 -->
      <section class="filters-section">
        <div class="filters-header">
          <h2 class="filters-title">
            <i class="fas fa-filter"></i> 作品筛选
            <span class="result-count" v-if="total > 0">共 {{ total }} 件作品</span>
          </h2>
          <button class="toggle-filters-btn" @click="toggleFilters" :title="filtersCollapsed ? '展开筛选' : '收起筛选'">
            <i class="fas fa-chevron-up" v-if="!filtersCollapsed"></i>
            <i class="fas fa-chevron-down" v-if="filtersCollapsed"></i>
          </button>
        </div>

        <div class="filters-content" v-show="!filtersCollapsed">
          <!-- 艺术时期筛选 -->
          <div class="filter-group">
            <label class="filter-label"> <i class="fas fa-clock"></i> 艺术时期 </label>
            <div class="period-tags">
              <button
                v-for="period in artPeriods"
                :key="period.val"
                class="period-tag"
                :class="{ active: selectedPeriod === period.val }"
                @click="selectPeriod(period.val)"
              >
                {{ period.label }}
                <span class="count">({{ getPeriodCount(period.val) }})</span>
              </button>
            </div>
          </div>

          <!-- 分类筛选 -->
          <div class="filter-group" v-if="selectedCategory !== 'all'">
            <label class="filter-label">
              <i class="fas fa-palette"></i> {{ getCategoryLabel(selectedCategory) }}分类
            </label>
            <div class="category-tags">
              <button
                v-for="tag in getCategoryTags()"
                :key="tag.tag_id"
                class="category-tag"
                :class="{ active: isTagSelected(tag.tag_id) }"
                @click="toggleTag(tag)"
              >
                {{ tag.tag_name }}
                <span class="count">({{ getTagCount(tag.tag_id) }})</span>
              </button>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="filter-group search-box">
            <label class="filter-label"> <i class="fas fa-search"></i> 搜索作品 </label>
            <div class="search-input-wrapper">
              <input
                type="text"
                class="search-input"
                v-model="searchKeyword"
                @input="onSearchInput"
                @keyup.enter="triggerSearch"
                placeholder="输入作品名称或关键词..."
              />
              <button class="clear-search-btn" v-if="searchKeyword" @click="clearSearch" title="清空搜索">
                <i class="fas fa-times"></i>
              </button>
              <button class="search-btn" @click="triggerSearch" title="搜索">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>

          <!-- 已选筛选条件 -->
          <div class="active-filters" v-if="hasActiveFilters">
            <span class="filter-label">已选条件：</span>
            <span class="filter-badge" v-if="selectedPeriod !== 'all'">
              时期：{{ getPeriodLabel(selectedPeriod) }}
              <i class="fas fa-times" @click="selectedPeriod = 'all'"></i>
            </span>
            <span class="filter-badge" v-if="searchKeyword">
              搜索：{{ searchKeyword }}
              <i class="fas fa-times" @click="clearSearch"></i>
            </span>
            <span class="filter-badge" v-for="tag in selectedTags" :key="tag.tag_id">
              {{ tag.tag_name }}
              <i class="fas fa-times" @click="removeTag(tag)"></i>
            </span>
            <button class="clear-all-btn" @click="clearAllFilters"><i class="fas fa-times-circle"></i> 清空全部</button>
          </div>
        </div>
      </section>

      <!-- 作品网格 -->
      <div class="gallery-grid" id="galleryGrid">
        <div v-for="art in works" :key="art.id" class="artwork-card">
          <div class="artwork-img-container">
            <img :src="art.thumbnail" :alt="art.title" class="artwork-image" @click="viewArtworkDetail(art.id)" />
            <div class="artwork-overlay" @click="viewArtworkDetail(art.id)">
              <button class="view-btn"><i class="fas fa-eye"></i> 查看详情</button>
            </div>
          </div>
          <div class="artwork-info">
            <h3 class="artwork-title" @click="viewArtworkDetail(art.id)">{{ art.title }}</h3>
            <div class="artwork-meta">
              <span class="meta-item" v-if="art.year"> <i class="fas fa-calendar-alt"></i> {{ art.year }}年 </span>
              <span class="meta-item period-badge" :class="art.period">
                <i class="fas fa-clock"></i> {{ getPeriodLabel(art.period) }}
              </span>
            </div>
            <div class="artwork-tags">
              <span v-for="t in getDisplayTags(art.tags)" :key="t" class="artwork-tag" @click.stop="filterByTag(t)">
                {{ t }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && works.length > 0">
        <button class="load-more-btn" @click="loadMore" :disabled="isLoading">
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <span v-else> <i class="fas fa-plus"></i> 加载更多作品 </span>
          <span class="loaded-info">（已加载 {{ works.length }}/{{ total }}）</span>
        </button>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="works.length === 0 && !isLoading">
        <div class="empty-icon">
          <i class="fas fa-images"></i>
        </div>
        <h3>未找到符合条件的作品</h3>
        <p>请尝试调整筛选条件或搜索关键词</p>
        <button class="reset-btn" @click="clearAllFilters"><i class="fas fa-redo"></i> 重置筛选条件</button>
      </div>

      <!-- 加载状态 -->
      <div class="loading-state" v-if="isLoading && works.length === 0">
        <div class="loading-icon">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>正在加载作品...</p>
      </div>
    </main>

    <!-- 返回顶部按钮 -->
    <button class="back-to-top" @click="scrollToTop" v-show="showBackToTop">
      <i class="fas fa-arrow-up"></i>
    </button>
  </body>
</template>

<script>
import HeaderNavbar from '../components/HeaderNavbar.vue';

export default {
  name: 'GalleryPage',
  components: { HeaderNavbar },
  data() {
    return {
      filtersCollapsed: false,
      showBackToTop: true,
      selectedCategory: 'all',
      selectedPeriod: 'all',
      selectedTags: [],
      searchKeyword: '',
      currentPage: 1,
      itemsPerPage: 12,
      allWorks: [],
      allWorksTotal: 0,
      works: [],
      total: 0,
      isLoading: false,
      searchTimeout: null,

      // 分类选项
      categories: [
        { val: 'all', label: '全部作品' },
        { val: '山水画', label: '山水画' },
        { val: '花鸟画', label: '花鸟画' },
        { val: '书法', label: '书法' }
      ],

      // 艺术时期
      artPeriods: [
        { val: 'all', label: '全部时期' },
        { val: '早期', label: '早期（1865-1906）' },
        { val: '中期', label: '中期（1907-1937）' },
        { val: '晚期', label: '晚期（1938-1955）' }
      ],

      // 标签分类
      tagCategories: {
        山水画: ['技法', '风格', '题材'],
        花鸟画: ['风格', '题材'],
        书法: ['书体', '风格']
      },

      // 标签缓存
      allTags: []
    };
  },
  computed: {
    hasMore() {
      return this.works.length < this.total;
    },
    hasActiveFilters() {
      return this.selectedPeriod !== 'all' || this.searchKeyword.trim() !== '' || this.selectedTags.length > 0;
    }
  },
  watch: {
    selectedPeriod() {
      this.resetAndSearch();
    },
    selectedCategory() {
      this.resetAndSearch();
    },
    '$route.query'() {
      this.applyRouteQuery();
    }
  },
  mounted() {
    this.applyRouteQuery();
    this.fetchTags();
    this.fetchWorks();
    window.addEventListener('scroll', this.handleScroll);
  },
  methods: {
    toggleFilters() {
      this.filtersCollapsed = !this.filtersCollapsed;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 200;
    },

    // 分类切换
    changeCategory(category) {
      this.selectedCategory = category;
      this.selectedTags = [];
      this.selectedPeriod = 'all';
      this.resetAndSearch();
    },

    // 时期切换
    selectPeriod(period) {
      this.selectedPeriod = period;
      this.resetAndSearch();
    },

    // 获取分类标签
    async fetchTags() {
      try {
        const res = await fetch('/api/works/tags');
        const json = await res.json();
        if (json.code === 200) {
          this.allTags = (json.data || []).map((tag) => ({
            tag_id: tag.tagid,
            tag_name: tag.tagname,
            tag_category: tag.tagcategory,
            work_count: tag.workcount
          }));
        }
      } catch (e) {
        console.error('获取标签失败:', e);
      }
    },

    // 获取当前分类的标签
    getCategoryTags() {
      if (this.selectedCategory === 'all') return [];

      const categories = this.tagCategories[this.selectedCategory] || [];
      // 只显示有作品的标签（work_count > 0）
      return this.allTags.filter((tag) => categories.includes(tag.tag_category) && tag.work_count > 0);
    },

    // 标签选择
    toggleTag(tag) {
      const index = this.selectedTags.findIndex((t) => t.tag_id === tag.tag_id);
      if (index >= 0) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tag);
      }
      this.resetAndSearch();
    },

    isTagSelected(tagId) {
      return this.selectedTags.some((t) => t.tag_id === tagId);
    },

    removeTag(tag) {
      this.selectedTags = this.selectedTags.filter((t) => t.tag_id !== tag.tag_id);
      this.resetAndSearch();
    },

    filterByTag(tagName) {
      const tag = this.allTags.find((t) => t.tag_name === tagName);
      if (tag && !this.isTagSelected(tag.tag_id)) {
        this.selectedTags.push(tag);
        this.resetAndSearch();
      }
    },

    // 搜索
    onSearchInput() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.resetAndSearch(), 500);
    },
    triggerSearch() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.resetAndSearch();
    },
    clearSearch() {
      this.searchKeyword = '';
      this.resetAndSearch();
    },

    // 清空所有筛选
    clearAllFilters() {
      this.selectedPeriod = 'all';
      this.searchKeyword = '';
      this.selectedTags = [];
      this.resetAndSearch();
    },

    // 重置并搜索
    resetAndSearch() {
      this.currentPage = 1;
      this.works = [];
      this.fetchWorks(false);
    },

    // 获取作品列表
    async fetchWorks(isLoadMore = false) {
      if (this.isLoading) return;
      this.isLoading = true;

      if (!isLoadMore) {
        this.currentPage = 1;
        this.works = [];
      }

      try {
        const params = new URLSearchParams();
        params.append('page', this.currentPage.toString());
        params.append('size', this.itemsPerPage.toString());

        // 首次加载全部作品时，请求更大size用于统计
        const fetchForStats =
            !isLoadMore &&
            this.selectedCategory === 'all' &&
            this.selectedPeriod === 'all' &&
            this.selectedTags.length === 0 &&
            this.searchKeyword.trim() === '';

        // 分类筛选
        if (this.selectedCategory !== 'all') {
          params.append('category', this.selectedCategory);
        }

        // 时期筛选
        if (this.selectedPeriod !== 'all') {
          params.append('art_period', this.selectedPeriod);
        }

        // 搜索关键词
        if (this.searchKeyword.trim()) {
          params.append('works_name', this.searchKeyword.trim());
        }

        // 标签筛选
        if (this.selectedTags.length > 0) {
          const tagIds = this.selectedTags.map((t) => t.tag_id).join(',');
          params.append('tag_ids', tagIds);
        }

        const url = `/api/works/list?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.code === 200) {
          const list = json.data.list.map((i) => ({
            id: i.worksId,
            title: i.worksName,
            year: i.creationYear,
            category: i.category,
            period: i.art_period || this.getPeriod(i.creationYear),
            thumbnail: i.thumbnailUrl || '/images/default.jpg',
            size: i.size || '尺寸不详',
            description: i.worksDesc || '暂无简介',
            tags: i.tags || []
          }));

          if (isLoadMore) {
            this.works = [...this.works, ...list];
          } else {
            this.works = list;
            // 首次加载全部作品时，额外请求所有数据用于统计
            if (fetchForStats) {
              await this.fetchAllWorksForStats();
            }
          }

          this.total = json.data.total || 0;
        } else {
          console.error('API错误:', json.msg);
          if (!isLoadMore) this.works = [];
        }
      } catch (e) {
        console.error('请求失败:', e);
        if (!isLoadMore) this.works = [];
      } finally {
        this.isLoading = false;
      }
    },

    loadMore() {
      if (this.hasMore && !this.isLoading) {
        this.currentPage++;
        this.fetchWorks(true);
      }
    },

    // 获取所有作品数据用于统计
    async fetchAllWorksForStats() {
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('size', '100');
        const url = `/api/works/list?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.code === 200) {
          this.allWorks = json.data.list.map((i) => ({
            id: i.worksId,
            title: i.worksName,
            year: i.creationYear,
            category: i.category,
            period: i.art_period || this.getPeriod(i.creationYear),
            thumbnail: i.thumbnailUrl || '/images/default.jpg',
            size: i.size || '尺寸不详',
            description: i.worksDesc || '暂无简介',
            tags: i.tags || []
          }));
          this.allWorksTotal = json.data.total || 0;
        }
      } catch (e) {
        console.error('获取统计数据失败:', e);
      }
    },

    viewArtworkDetail(id) {
      this.$router.push({ path: '/work', query: { id } });
    },

    // 辅助方法
    getPeriod(year) {
      if (!year) return 'unknown';
      if (year <= 1906) return '早期';
      if (year <= 1937) return '中期';
      return '晚期';
    },

    getPeriodLabel(period) {
      return { early: '早期', middle: '中期', late: '晚期', unknown: '未分类' }[period] || period;
    },

    getCategoryLabel(category) {
      return category === 'all' ? '全部' : category;
    },

    getCategoryCount(category) {
      if (this.allWorks.length === 0) return 0;
      if (category === 'all') return this.allWorksTotal;
      return this.allWorks.filter((w) => w.category === category).length;
    },

    getPeriodCount(period) {
      if (this.allWorks.length === 0) return 0;
      // 只统计当前分类下的作品
      const filteredByCategory =
          this.selectedCategory === 'all'
            ? this.allWorks
            : this.allWorks.filter((w) => w.category === this.selectedCategory);

      if (period === 'all') return filteredByCategory.length;
      return filteredByCategory.filter((w) => w.period === period).length;
    },

    getTagCount(tagId) {
      if (this.allWorks.length === 0) return 0;
      // 根据tagId找到标签名称
      const tag = this.allTags.find((t) => t.tag_id === tagId);
      if (!tag) return 0;

        const tagName = tag.tag_name;

        // 只统计当前分类和时期下的作品
      let filtered = this.allWorks;
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter((w) => w.category === this.selectedCategory);
      }
      if (this.selectedPeriod !== 'all') {
        filtered = filtered.filter((w) => w.period === this.selectedPeriod);
      }

        // 后端返回的tags是字符串数组（标签名称）
      return filtered.filter((w) => w.tags && w.tags.includes(tagName)).length;
    },

    getDisplayTags(tags) {
      if (!tags) return [];
      return tags.map((t) => (typeof t === 'object' ? t.tag_name : t)).slice(0, 3);
    },

    applyRouteQuery() {
      const tag = this.$route.query.tag;
      if (!tag) return;

      const tagObj = this.allTags.find((t) => t.tag_name === tag);
      if (tagObj) {
        this.selectedTags = [tagObj];

        // 根据标签类型设置分类
        if (tagObj.tag_category === '书体') {
          this.selectedCategory = '书法';
        } else if (tagObj.tag_category === '题材') {
          if (tagObj.tag_name === '花鸟') {
            this.selectedCategory = '花鸟画';
          } else {
            this.selectedCategory = '山水画';
          }
        }
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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

  .main-content {
    padding-top: 100px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  /* 页面标题 */
  .page-header {
    text-align: center;
    padding: 20px 15px;
    border-radius: 15px;
    margin-bottom: 20px;
    margin-top: 40px;
  }

  .page-title {
    color: #8b4513;
    font-size: 36px;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .page-subtitle {
    color: #5c4033;
    font-size: 18px;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* 分类导航 */
  .sub-nav-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px;
  }

  .sub-nav {
    display: inline-flex;
    background: #fff;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
  }

  .sub-nav-btn {
    padding: 12px 28px;
    border: none;
    background: transparent;
    color: #5c4033;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sub-nav-btn:hover {
    background: #f5f0e6;
  }

  .sub-nav-btn.active {
    background: #d2b48c;
    color: #fff;
    font-weight: 500;
  }

  .sub-nav-btn .count {
    font-size: 12px;
    opacity: 0.8;
  }

  /* 筛选器 */
  .filters-section {
    background-color: white;
    border-radius: 8px;
    padding: 25px;
    margin: 0 60px;
    margin-top: -1px;
    margin-bottom: 20px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .filters-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a3c40;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .result-count {
    font-size: 0.9rem;
    color: #666;
    font-weight: 400;
    margin-left: 10px;
  }

  .toggle-filters-btn {
    background: none;
    border: none;
    color: #5c4033;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.3s;
  }

  .toggle-filters-btn:hover {
    transform: scale(1.1);
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
    color: #555;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* 时期标签 */
  .period-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .period-tag {
    padding: 8px 16px;
    border: 1px solid #d2b48c;
    background: #fff;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    color: #5c4033;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .period-tag:hover {
    background: #f5f0e6;
  }

  .period-tag.active {
    background: #d2b48c;
    color: #fff;
    border-color: #d2b48c;
  }

  .period-tag .count {
    font-size: 12px;
    opacity: 0.8;
  }

  /* 分类标签 */
  .category-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .category-tag {
    padding: 6px 14px;
    border: 1px solid #d2b48c;
    background: #fff;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s;
    color: #5c4033;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .category-tag:hover {
    background: #f5f0e6;
  }

  .category-tag.active {
    background: #d2b48c;
    color: #fff;
    border-color: #d2b48c;
  }

  .category-tag .count {
    font-size: 11px;
    opacity: 0.8;
  }

  /* 搜索框 */
  .search-box {
    margin-top: 20px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    padding: 12px 50px 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    background-color: white;
    transition: border-color 0.3s;
  }

  .search-input:focus {
    outline: none;
    border-color: #d2b48c;
  }

  .clear-search-btn {
    position: absolute;
    right: 45px;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    transition: color 0.3s;
  }

  .clear-search-btn:hover {
    color: #666;
  }

  .search-btn {
    position: absolute;
    right: 8px;
    background: #d2b48c;
    border: none;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
  }

  .search-btn:hover {
    background: #a67c52;
  }

  /* 已选筛选条件 */
  .active-filters {
    margin-top: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  .active-filters .filter-label {
    margin-bottom: 0;
    font-weight: 600;
  }

  .filter-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #d2b48c;
    color: #fff;
    border-radius: 15px;
    font-size: 13px;
  }

  .filter-badge i {
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s;
  }

  .filter-badge i:hover {
    opacity: 1;
  }

  .clear-all-btn {
    padding: 6px 14px;
    background: #6c757d;
    color: #fff;
    border: none;
    border-radius: 15px;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background-color 0.3s;
  }

  .clear-all-btn:hover {
    background: #5a6268;
  }

  /* 作品网格 */
  .gallery-grid {
    column-count: 3;
    column-gap: 20px;
    padding: 25px;
    margin: 0 60px;
    margin-bottom: 40px;
  }

  .artwork-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    break-inside: avoid;
    margin-bottom: 25px;
    display: inline-block;
    width: 100%;
  }

  .artwork-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .artwork-img-container {
    position: relative;
    overflow: hidden;
    background-color: #f8f9fa;
    cursor: pointer;
  }

  .artwork-image {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s;
  }

  .artwork-card:hover .artwork-image {
    transform: scale(1.05);
  }

  .artwork-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .artwork-card:hover .artwork-overlay {
    opacity: 1;
  }

  .view-btn {
    padding: 10px 20px;
    background: #d2b48c;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background-color 0.3s;
  }

  .view-btn:hover {
    background: #a67c52;
  }

  .artwork-info {
    padding: 15px;
  }

  .artwork-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a3c40;
    cursor: pointer;
    transition: color 0.3s;
  }

  .artwork-title:hover {
    color: #d2b48c;
  }

  .artwork-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 0.85rem;
    color: #666;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .period-badge {
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 12px;
    background: #e8dfca;
    color: #5c4033;
  }

  .period-badge.早期 {
    background: #e3f2fd;
    color: #1976d2;
  }

  .period-badge.中期 {
    background: #fff3e0;
    color: #f57c00;
  }

  .period-badge.晚期 {
    background: #fce4ec;
    color: #c2185b;
  }

  .artwork-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .artwork-tag {
    background-color: #f0e6d6;
    border: 1px solid #d2b48c;
    border-radius: 10px;
    padding: 3px 8px;
    font-size: 11px;
    color: #5c4033;
    cursor: pointer;
    transition: all 0.3s;
  }

  .artwork-tag:hover {
    background-color: #d2b48c;
    color: #fff;
  }

  /* 加载更多 */
  .load-more {
    text-align: center;
    margin: 30px 0;
  }

  .load-more-btn {
    padding: 12px 30px;
    background-color: #d2b48c;
    border: none;
    border-radius: 8px;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    font-size: 15px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .load-more-btn:hover {
    background-color: #a67c52;
    color: #fff;
  }

  .load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loaded-info {
    font-size: 13px;
    color: #666;
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

  .reset-btn {
    margin-top: 20px;
    padding: 10px 24px;
    background: #d2b48c;
    border: none;
    border-radius: 20px;
    color: #333;
    cursor: pointer;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s;
  }

  .reset-btn:hover {
    background: #a67c52;
    color: #fff;
  }

  /* 加载状态 */
  .loading-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .loading-icon {
    font-size: 40px;
    color: #d2b48c;
    margin-bottom: 15px;
  }

  /* 返回顶部 */
  .back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 50%;
    background-color: #d2b48c;
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
    z-index: 100;
  }

  .back-to-top:hover {
    background-color: #a67c52;
    transform: scale(1.1);
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .gallery-grid {
      column-count: 2;
    }
  }

  @media (max-width: 768px) {
    .page-title {
      font-size: 28px;
    }

    .filters-section,
    .gallery-grid {
      margin-left: 20px;
      margin-right: 20px;
    }

    .sub-nav-wrap {
      padding: 0 20px;
    }

    .gallery-grid {
      column-count: 1;
    }

    .period-tags,
    .category-tags {
      flex-direction: column;
    }

    .period-tag,
    .category-tag {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
