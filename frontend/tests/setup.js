// Jest setup file
import { jest } from '@jest/globals';

// Mock Three.js global object
global.THREE = {
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BoxGeometry: jest.fn(),
  PlaneGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(),
  DirectionalLight: jest.fn(),
  AmbientLight: jest.fn(),
  PointLight: jest.fn(),
  SpotLight: jest.fn(),
  Vector3: jest.fn(),
  Euler: jest.fn(),
  Color: jest.fn(),
  TextureLoader: jest.fn(),
  Group: jest.fn(),
  Raycaster: jest.fn()
};

// Mock GSAP global object
global.GSAP = {
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  timeline: jest.fn(),
  set: jest.fn()
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
