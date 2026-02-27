// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 3000, // 前端端口（默认8080，可改）
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // 后端地址
        changeOrigin: true,              // 把请求头中的 Host 改成 target
        pathRewrite: { '^/api': '/api' } // 可选：如果后端前缀就是 /api，可省略
      }
    }
  }
})