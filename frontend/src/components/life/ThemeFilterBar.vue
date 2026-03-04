<template>
  <div class="theme-filter-bar">
    <button
      v-for="theme in themes"
      :key="theme.id"
      class="theme-item"
      :class="{ active: isActive(theme.id) }"
      @click="toggle(theme.id)"
    >
      <!-- 墨滴點綴：始終顯示主題色 -->
      <span class="ink-dot" :style="{ backgroundColor: theme.color }"></span>
      <span class="theme-label">{{ theme.label }}</span>
      
      <!-- 激活狀態的底紋 -->
      <div v-if="isActive(theme.id)" class="active-glow" :style="{ backgroundColor: theme.color }"></div>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ThemeFilterBar',
  props: {
    themes: { type: Array, required: true },
    modelValue: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue'],
  methods: {
    isActive(id) { return this.modelValue.includes(id); },
    toggle(id) {
      const next = this.isActive(id)
        ? this.modelValue.filter((t) => t !== id)
        : [...this.modelValue, id];
      this.$emit('update:modelValue', next);
    }
  }
};
</script>

<style scoped>
.theme-filter-bar {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 8px 20px;
  /* 移除背景色，由父級容器決定 */
  background: transparent;
}

.theme-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border: 1px solid rgba(61, 43, 31, 0.1);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.ink-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 2px rgba(0,0,0,0.1);
}

.theme-label {
  font-family: "KaiTi", serif;
  font-size: 14px;
  color: #8b7d6b;
  z-index: 2;
  transition: color 0.3s;
}

.theme-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(61, 43, 31, 0.2);
}

/* 激活狀態 */
.theme-item.active {
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.theme-item.active .theme-label {
  color: #3d2b1f;
  font-weight: bold;
}

.active-glow {
  position: absolute;
  inset: 0;
  opacity: 0.12; /* 極淡的暈染效果 */
  z-index: 1;
}

/* 鼠標懸停在已激活項上時加深一點點 */
.theme-item.active:hover .active-glow {
  opacity: 0.18;
}
</style>
