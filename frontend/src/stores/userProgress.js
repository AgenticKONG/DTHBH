import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 用户进度管理Store（Pinia版本）
 * 替代原有的Vuex store
 */
export const useUserProgressStore = defineStore('userProgress', () => {
  // State
  const userProgress = ref({
    lastVisit: null,
    visitedModules: [],
    favorites: [],
    notes: {},
    achievements: []
  });

  // Actions
  const loadUserProgress = () => {
    try {
      const savedProgress = localStorage.getItem('huangbinhong-progress');
      if (savedProgress) {
        userProgress.value = { ...userProgress.value, ...JSON.parse(savedProgress) };
      }
    } catch (e) {
      console.warn('加载用户进度失败:', e);
    }
  };

  const saveUserProgress = () => {
    try {
      localStorage.setItem('huangbinhong-progress', JSON.stringify(userProgress.value));
    } catch (e) {
      console.warn('保存进度失败:', e);
    }
  };

  const updateProgress = (progress) => {
    userProgress.value = { ...userProgress.value, ...progress };
    saveUserProgress();
  };

  const addToFavorites = (item) => {
    if (!userProgress.value.favorites.some((fav) => fav.id === item.id)) {
      userProgress.value.favorites.push({
        ...item,
        addedAt: new Date().toISOString()
      });
      saveUserProgress();
    }
  };

  const removeFromFavorites = (itemId) => {
    userProgress.value.favorites = userProgress.value.favorites.filter((fav) => fav.id !== itemId);
    saveUserProgress();
  };

  const addNote = (module, note) => {
    if (!userProgress.value.notes[module]) {
      userProgress.value.notes[module] = [];
    }
    userProgress.value.notes[module].push({
      id: Date.now(),
      content: note,
      createdAt: new Date().toISOString()
    });
    saveUserProgress();
  };

  const removeNote = (module, noteId) => {
    if (userProgress.value.notes[module]) {
      userProgress.value.notes[module] = userProgress.value.notes[module].filter((note) => note.id !== noteId);
      saveUserProgress();
    }
  };

  // Getters
  const isFavorite = computed(() => {
    return (itemId) => userProgress.value.favorites.some((fav) => fav.id === itemId);
  });

  const moduleNotes = computed(() => {
    return (module) => userProgress.value.notes[module] || [];
  });

  const favoritesCount = computed(() => userProgress.value.favorites.length);

  // 初始化时加载用户进度
  loadUserProgress();

  return {
    // State
    userProgress,
    // Actions
    loadUserProgress,
    saveUserProgress,
    updateProgress,
    addToFavorites,
    removeFromFavorites,
    addNote,
    removeNote,
    // Getters
    isFavorite,
    moduleNotes,
    favoritesCount
  };
});
