module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/prettier'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  globals: {
    AMap: 'readonly',
    Three: 'readonly',
    GSAP: 'readonly'
  },
  rules: {
    // 代码风格规则
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'no-trailing-spaces': 'warn',
    'eol-last': ['warn', 'always'],
    'no-multiple-empty-lines': ['warn', { max: 1 }],

    // Vue组件规则
    'vue/multi-word-component-names': 'off',
    'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    'vue/component-definition-name-casing': ['warn', 'PascalCase'],
    'vue/prop-name-casing': ['warn', 'camelCase'],
    'vue/attribute-hyphenation': ['warn', 'never'],
    'vue/v-on-event-hyphenation': ['warn', 'never'],

    // 变量命名规则
    'camelcase': ['warn', { properties: 'never' }],
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],

    // 性能相关规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // 可访问性规则
    'vue/no-deprecated-slot-attribute': 'warn',
    'vue/no-deprecated-slot-scope-attribute': 'warn'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'max-len': 'off'
      }
    },
    {
      files: ['*.js'],
      rules: {
        'max-len': ['warn', { code: 120, ignoreComments: true }]
      }
    },
    {
      files: ['tests/**/*.js', 'tests/**/*.spec.js'],
      env: {
        jest: true
      }
    }
  ]
}