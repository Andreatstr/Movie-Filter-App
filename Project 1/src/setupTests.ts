import '@testing-library/jest-dom';


Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});
