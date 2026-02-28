<template>
  <div class="theme-filter-bar">
    <button
      v-for="theme in themes"
      :key="theme.id"
      class="theme-pill"
      :class="{ active: isActive(theme.id) }"
      :style="isActive(theme.id) ? { borderColor: theme.color, color: theme.color } : {}"
      @click="toggle(theme.id)"
    >
      {{ theme.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ThemeFilterBar',
  props: {
    themes: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  methods: {
    isActive(id) {
      return this.modelValue.includes(id);
    },
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
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 24px;
  border-top: 1px solid rgba(139, 69, 19, 0.15);
  background: #f4efdf;
  backdrop-filter: blur(8px);
}

.theme-pill {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(90, 70, 40, 0.25);
  background: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  color: #5a4628;
  transition: all 0.2s ease;
}

.theme-pill:hover {
  background: rgba(255, 255, 255, 0.8);
}

.theme-pill.active {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 1px currentColor;
}
</style>

