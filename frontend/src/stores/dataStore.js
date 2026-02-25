import { reactive, computed } from 'vue';
import { getAll, getLocations, getTimeline } from '@/api';

/**
 * 统一数据管理Store
 * 用于管理交游和生平模块的数据
 */
export const useDataStore = () => {
  const state = reactive({
    loading: false,
    error: null,
    cache: {
      all: null,
      locations: null,
      timeline: null
    },
    lastFetch: {
      all: null,
      locations: null,
      timeline: null
    }
  });

  // 缓存时间（毫秒）
  const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  /**
   * 检查缓存是否有效
   */
  const isCacheValid = (cacheKey) => {
    const lastFetch = state.lastFetch[cacheKey];
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  };

  /**
   * 获取所有数据
   */
  const fetchAllData = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('all') && state.cache.all) {
      return state.cache.all;
    }

    state.loading = true;
    state.error = null;

    try {
      const data = await getAll();
      state.cache.all = data;
      state.lastFetch.all = Date.now();
      return data;
    } catch (error) {
      state.error = error.message || '获取数据失败';
      console.error('获取所有数据失败:', error);
      throw error;
    } finally {
      state.loading = false;
    }
  };

  /**
   * 获取地点数据
   */
  const fetchLocationsData = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('locations') && state.cache.locations) {
      return state.cache.locations;
    }

    state.loading = true;
    state.error = null;

    try {
      const data = await getLocations();
      state.cache.locations = data;
      state.lastFetch.locations = Date.now();
      return data;
    } catch (error) {
      state.error = error.message || '获取地点数据失败';
      console.error('获取地点数据失败:', error);
      throw error;
    } finally {
      state.loading = false;
    }
  };

  /**
   * 获取时间轴数据
   */
  const fetchTimelineData = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('timeline') && state.cache.timeline) {
      return state.cache.timeline;
    }

    state.loading = true;
    state.error = null;

    try {
      const data = await getTimeline();
      state.cache.timeline = data;
      state.lastFetch.timeline = Date.now();
      return data;
    } catch (error) {
      state.error = error.message || '获取时间轴数据失败';
      console.error('获取时间轴数据失败:', error);
      throw error;
    } finally {
      state.loading = false;
    }
  };

  /**
   * 清除缓存
   */
  const clearCache = (cacheKey = 'all') => {
    if (cacheKey === 'all') {
      state.cache = {
        all: null,
        locations: null,
        timeline: null
      };
      state.lastFetch = {
        all: null,
        locations: null,
        timeline: null
      };
    } else {
      state.cache[cacheKey] = null;
      state.lastFetch[cacheKey] = null;
    }
  };

  /**
   * 重置状态
   */
  const resetState = () => {
    state.loading = false;
    state.error = null;
    clearCache('all');
  };

  // Computed properties
  const isLoading = computed(() => state.loading);
  const hasError = computed(() => state.error !== null);
  const errorMessage = computed(() => state.error);

  return {
    state,
    isLoading,
    hasError,
    errorMessage,
    fetchAllData,
    fetchLocationsData,
    fetchTimelineData,
    clearCache,
    resetState
  };
};

// 创建全局实例
let globalStore = null;

/**
 * 获取全局数据Store实例
 */
export const getDataStore = () => {
  if (!globalStore) {
    globalStore = useDataStore();
  }
  return globalStore;
};
