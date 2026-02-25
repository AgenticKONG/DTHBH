import LazyImage from '../components/LazyImage.vue';

export default {
  install(app) {
    // 全局注册LazyImage组件
    app.component('LazyImage', LazyImage);

    // 全局注册图片懒加载指令
    app.directive('lazy', {
      mounted(el, binding) {
        const src = binding.value;
        const placeholder = el.getAttribute('data-placeholder') || '';

        // 设置占位图
        if (placeholder) {
          el.src = placeholder;
        }

        // 创建 Intersection Observer
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // 图片进入视口，加载实际图片
                const img = new Image();
                img.onload = () => {
                  el.src = src;
                  el.classList.add('lazy-loaded');
                };
                img.onerror = () => {
                  el.classList.add('lazy-error');
                };
                img.src = src;

                // 停止观察
                observer.unobserve(el);
              }
            });
          },
          {
            root: null,
            rootMargin: '100px',
            threshold: 0.01
          }
        );

        // 保存观察者引用
        el._lazyObserver = observer;

        // 开始观察
        observer.observe(el);
      },

      unmounted(el) {
        // 清理观察者
        if (el._lazyObserver) {
          el._lazyObserver.disconnect();
        }
      }
    });
  }
};
