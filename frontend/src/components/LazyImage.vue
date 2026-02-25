<template>
  <div class="lazy-image-container" ref="container">
    <!-- 占位图 -->
    <img v-if="!loaded && placeholder" :src="placeholder" :alt="alt" class="lazy-placeholder" />

    <!-- 加载中的占位 -->
    <div v-else-if="!loaded" class="lazy-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- 实际图片 -->
    <img v-show="loaded" ref="image" :src="actualSrc" :alt="alt" :class="imageClass" @load="onLoad" @error="onError" />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    threshold: {
      type: Number,
      default: 100 // 提前加载的距离（像素）
    }
  },
  emits: ['load', 'error'],
  setup(props, { emit }) {
    const container = ref(null);
    const image = ref(null);
    const loaded = ref(false);
    const actualSrc = ref('');
    let observer = null;

    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 图片进入视口，开始加载
          loadImage();
          // 停止观察
          observer.unobserve(entry.target);
        }
      });
    };

    const loadImage = () => {
      // 创建新图片对象预加载
      const img = new Image();
      img.onload = () => {
        actualSrc.value = props.src;
        loaded.value = true;
        emit('load');
      };
      img.onerror = () => {
        emit('error');
      };
      img.src = props.src;
    };

    const onLoad = () => {
      // 图片加载完成
    };

    const onError = () => {
      // 图片加载失败，显示错误状态
      loaded.value = true;
      actualSrc.value = props.placeholder || '';
    };

    onMounted(() => {
      // 创建 Intersection Observer
      observer = new IntersectionObserver(onIntersect, {
        root: null, // 使用视口作为根
        rootMargin: `${props.threshold}px`,
        threshold: 0.01
      });

        // 开始观察容器
      observer.observe(container.value);
    });

    onBeforeUnmount(() => {
      // 清理观察者
      if (observer) {
        observer.disconnect();
      }
    });

    return {
      container,
      image,
      loaded,
      actualSrc,
      onLoad,
      onError
    };
  }
};
</script>

<style scoped>
  .lazy-image-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .lazy-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(10px);
    transition: filter 0.3s ease;
  }

  .lazy-loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #8b4513;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .lazy-image-container img {
    transition: opacity 0.3s ease;
  }
</style>
