module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\.vue$': '@vue/vue3-jest',
    '^.+\.js$': 'babel-jest',
    '.+\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@three/(.*)$': '<rootDir>/src/three/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.spec.js',
    '**/tests/integration/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFiles: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  globals: {
    'vue-jest': {
      compilerOptions: {
        isCustomElement: tag => tag.startsWith('x-')
      }
    }
  }
}