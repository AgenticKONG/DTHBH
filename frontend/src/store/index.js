import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    userProgress: {
      lastVisit: null,
      visitedModules: [],
      favorites: [],
      notes: {},
      achievements: []
    }
  },
  mutations: {
    // 更新用户进度
    UPDATE_PROGRESS(state, progress) {
      state.userProgress = { ...state.userProgress, ...progress };
    },

    // 添加收藏
    ADD_FAVORITE(state, item) {
      if (!state.userProgress.favorites.some((fav) => fav.id === item.id)) {
        state.userProgress.favorites.push({
          ...item,
          addedAt: new Date().toISOString()
        });
      }
    },

    // 添加笔记
    ADD_NOTE(state, { module, note }) {
      if (!state.userProgress.notes[module]) {
        Vue.set(state.userProgress.notes, module, []);
      }
      state.userProgress.notes[module].push({
        id: Date.now(),
        content: note,
        createdAt: new Date().toISOString()
      });
    }
  },
  actions: {
    // 加载用户进度
    loadUserProgress({ commit }) {
      try {
        const savedProgress = localStorage.getItem('huangbinhong-progress');
        if (savedProgress) {
          commit('UPDATE_PROGRESS', JSON.parse(savedProgress));
        }
      } catch (e) {
        console.warn('加载用户进度失败:', e);
      }
    },

    // 保存用户进度
    saveUserProgress({ state }) {
      try {
        localStorage.setItem('huangbinhong-progress', JSON.stringify(state.userProgress));
      } catch (e) {
        console.warn('保存进度失败:', e);
      }
    },

    // 添加收藏
    addToFavorites({ commit, dispatch }, item) {
      commit('ADD_FAVORITE', item);
      dispatch('saveUserProgress');
    },

    // 添加笔记
    addNote({ commit, dispatch }, { module, note }) {
      commit('ADD_NOTE', { module, note });
      dispatch('saveUserProgress');
    }
  },
  getters: {
    isFavorite: (state) => (itemId) => {
      return state.userProgress.favorites.some((fav) => fav.id === itemId);
    },
    moduleNotes: (state) => (module) => {
      return state.userProgress.notes[module] || [];
    }
  }
});
