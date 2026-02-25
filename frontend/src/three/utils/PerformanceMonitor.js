/**
 * 性能监控器
 *
 * 职责:
 * - 监控 FPS（帧率）
 * - 监控内存使用
 * - 监控渲染性能
 * - 提供性能统计
 * - 性能警告和优化建议
 *
 * @author 开发SubAgent
 * @version 1.0.0
 * @since 2026-02-23
 */

export class PerformanceMonitor {
  constructor(options = {}) {
    // 监控配置
    this.config = {
      updateInterval: options.updateInterval || 1000, // 更新间隔（毫秒）
      sampleSize: options.sampleSize || 60, // FPS 采样大小
      fpsThreshold: options.fpsThreshold || 30, // FPS 警告阈值
      memoryThreshold: options.memoryThreshold || 500, // 内存警告阈值（MB）
      enableMemoryMonitoring: options.enableMemoryMonitoring !== false
    };

    // 监控状态
    this.isMonitoring = false;
    this.intervalId = null;

    // FPS 监控
    this.fps = {
      current: 0,
      average: 0,
      min: 60,
      max: 0,
      samples: [],
      lastTime: performance.now(),
      frameCount: 0
    };

    // 内存监控
    this.memory = {
      used: 0,
      total: 0,
      limit: 0,
      samples: []
    };

    // 渲染性能监控
    this.render = {
      frameTime: 0,
      frameTimeSamples: [],
      drawCalls: 0,
      triangles: 0,
      textures: 0,
      geometries: 0
    };

    // 性能警告
    this.warnings = [];

    // 回调函数
    this.onUpdate = null;
    this.onWarning = null;
  }

  /**
   * 开始监控
   */
  start() {
    if (this.isMonitoring) {
      console.warn('Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.fps.lastTime = performance.now();
    this.fps.frameCount = 0;

    console.log('Performance monitoring started');

    // 定期更新监控数据
    this.intervalId = setInterval(() => {
      this.update();
    }, this.config.updateInterval);
  }

  /**
   * 停止监控
   */
  stop() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Performance monitoring stopped');
  }

  /**
   * 更新监控数据
   */
  update() {
    // 更新 FPS
    this.updateFPS();

    // 更新内存
    if (this.config.enableMemoryMonitoring && performance.memory) {
      this.updateMemory();
    }

    // 检查性能警告
    this.checkWarnings();

    // 触发更新回调
    if (this.onUpdate) {
      this.onUpdate(this.getStats());
    }
  }

  /**
   * 更新 FPS
   */
  updateFPS() {
    const currentTime = performance.now();
    const delta = currentTime - this.fps.lastTime;

    // 计算当前 FPS
    if (delta >= 1000) {
      this.fps.current = Math.round((this.fps.frameCount * 1000) / delta);

      // 添加到采样数组
      this.fps.samples.push(this.fps.current);
      if (this.fps.samples.length > this.config.sampleSize) {
        this.fps.samples.shift();
      }

      // 计算平均 FPS
      const sum = this.fps.samples.reduce((a, b) => a + b, 0);
      this.fps.average = Math.round(sum / this.fps.samples.length);

      // 更新最小和最大 FPS
      this.fps.min = Math.min(this.fps.min, this.fps.current);
      this.fps.max = Math.max(this.fps.max, this.fps.current);

      // 重置计数器
      this.fps.lastTime = currentTime;
      this.fps.frameCount = 0;
    }
  }

  /**
   * 更新内存使用
   */
  updateMemory() {
    if (!performance.memory) {
      return;
    }

    this.memory.used = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
    this.memory.total = Math.round(performance.memory.totalJSHeapSize / 1048576); // MB
    this.memory.limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576); // MB

    // 添加到采样数组
    this.memory.samples.push({
      used: this.memory.used,
      total: this.memory.total,
      time: Date.now()
    });

    // 限制采样数组大小
    if (this.memory.samples.length > this.config.sampleSize) {
      this.memory.samples.shift();
    }
  }

  /**
   * 记录帧渲染时间
   */
  recordFrameTime(time) {
    this.render.frameTime = time;

    // 添加到采样数组
    this.render.frameTimeSamples.push(time);
    if (this.render.frameTimeSamples.length > this.config.sampleSize) {
      this.render.frameTimeSamples.shift();
    }
  }

  /**
   * 更新渲染统计
   */
  updateRenderStats(renderer, scene) {
    this.render.drawCalls = renderer.info.render.calls;
    this.render.triangles = renderer.info.render.triangles;
    this.render.textures = renderer.info.memory.textures;
    this.render.geometries = renderer.info.memory.geometries;
  }

  /**
   * 检查性能警告
   */
  checkWarnings() {
    this.warnings = [];

    // 检查 FPS
    if (this.fps.current < this.config.fpsThreshold) {
      this.warnings.push({
        type: 'fps',
        message: `FPS is low: ${this.fps.current} (threshold: ${this.config.fpsThreshold})`,
        severity: 'high'
      });
    }

    // 检查内存
    if (this.config.enableMemoryMonitoring && this.memory.used > this.config.memoryThreshold) {
      this.warnings.push({
        type: 'memory',
        message: `Memory usage is high: ${this.memory.used} MB (threshold: ${this.config.memoryThreshold} MB)`,
        severity: 'medium'
      });
    }

    // 触发警告回调
    if (this.warnings.length > 0 && this.onWarning) {
      this.onWarning(this.warnings);
    }
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      fps: {
        current: this.fps.current,
        average: this.fps.average,
        min: this.fps.min,
        max: this.fps.max
      },
      memory: {
        used: this.memory.used,
        total: this.memory.total,
        limit: this.memory.limit,
        usagePercent: this.memory.limit > 0 ? (this.memory.used / this.memory.limit) * 100 : 0
      },
      render: {
        frameTime: this.render.frameTime,
        drawCalls: this.render.drawCalls,
        triangles: this.render.triangles,
        textures: this.render.textures,
        geometries: this.render.geometries
      },
      warnings: [...this.warnings]
    };
  }

  /**
   * 获取 FPS 历史数据
   */
  getFPSHistory() {
    return [...this.fps.samples];
  }

  /**
   * 获取内存历史数据
   */
  getMemoryHistory() {
    return [...this.memory.samples];
  }

  /**
   * 获取帧时间历史数据
   */
  getFrameTimeHistory() {
    return [...this.render.frameTimeSamples];
  }

  /**
   * 设置更新回调
   */
  setUpdateCallback(callback) {
    this.onUpdate = callback;
  }

  /**
   * 设置警告回调
   */
  setWarningCallback(callback) {
    this.onWarning = callback;
  }

  /**
   * 增加帧计数（在渲染循环中调用）
   */
  tick() {
    this.fps.frameCount++;
  }

  /**
   * 获取性能报告
   */
  getReport() {
    const stats = this.getStats();

    return `
=== 性能监控报告 ===
FPS:
  当前: ${stats.fps.current}
  平均: ${stats.fps.average}
  最低: ${stats.fps.min}
  最高: ${stats.fps.max}

内存:
  已使用: ${stats.memory.used} MB
  总计: ${stats.memory.total} MB
  限制: ${stats.memory.limit} MB
  使用率: ${stats.memory.usagePercent.toFixed(2)}%

渲染:
  帧时间: ${stats.render.frameTime.toFixed(2)} ms
  绘制调用: ${stats.render.drawCalls}
  三角形: ${stats.render.triangles}
  纹理: ${stats.render.textures}
  几何体: ${stats.render.geometries}

警告: ${stats.warnings.length}
${stats.warnings.map((w) => `  [${w.severity.toUpperCase()}] ${w.message}`).join('\n')}
`;
  }

  /**
   * 重置监控数据
   */
  reset() {
    this.fps = {
      current: 0,
      average: 0,
      min: 60,
      max: 0,
      samples: [],
      lastTime: performance.now(),
      frameCount: 0
    };

    this.memory = {
      used: 0,
      total: 0,
      limit: 0,
      samples: []
    };

    this.render = {
      frameTime: 0,
      frameTimeSamples: [],
      drawCalls: 0,
      triangles: 0,
      textures: 0,
      geometries: 0
    };

    this.warnings = [];

    console.log('Performance monitor data reset');
  }

  /**
   * 销毁性能监控器
   */
  destroy() {
    this.stop();
    this.reset();
    console.log('Performance monitor destroyed');
  }
}
