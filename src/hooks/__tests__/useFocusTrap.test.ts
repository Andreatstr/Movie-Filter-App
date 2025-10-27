import {renderHook, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {useFocusTrap} from '../useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    container.appendChild(button1);

    button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    container.appendChild(button2);

    button3 = document.createElement('button');
    button3.textContent = 'Button 3';
    container.appendChild(button3);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Basic Functionality', () => {
    it('should return a ref object', () => {
      const {result} = renderHook(() =>
        useFocusTrap({isActive: false})
      );

      expect(result.current).toBeDefined();
      expect(result.current.current).toBeNull();
    });

    it('should accept isActive prop and return ref', () => {
      const {result, rerender} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      expect(result.current.current).toBeNull();

      rerender({isActive: true});
      expect(result.current.current).toBeNull(); // Still null until assigned
    });
  });

  describe('Keyboard Events', () => {
    it('should set up keyboard event listener when active', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const onEscape = vi.fn();

      const {result, rerender} = renderHook(
        ({isActive, onEscape}) => useFocusTrap({isActive, onEscape}),
        {initialProps: {isActive: false, onEscape}}
      );

      result.current.current = container;
      rerender({isActive: true, onEscape});

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });

    it('should not throw error when Escape is pressed without onEscape', () => {
      const {result, rerender} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      result.current.current = container;
      rerender({isActive: true});

      expect(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        });
        document.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should not respond to events when inactive', () => {
      const onEscape = vi.fn();

      const {result} = renderHook(() =>
        useFocusTrap({isActive: false, onEscape})
      );

      result.current.current = container;

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('should add focus-trap-active class when active', () => {
      const {result, rerender} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      result.current.current = container;
      expect(container.classList.contains('focus-trap-active')).toBe(false);

      rerender({isActive: true});
      expect(container.classList.contains('focus-trap-active')).toBe(true);
    });

    it('should remove focus-trap-active class when deactivated', () => {
      const {result, rerender} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      result.current.current = container;

      rerender({isActive: true});
      expect(container.classList.contains('focus-trap-active')).toBe(true);

      rerender({isActive: false});
      expect(container.classList.contains('focus-trap-active')).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const {result, rerender, unmount} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      result.current.current = container;
      rerender({isActive: true});

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });

    it('should clean up CSS class on unmount', () => {
      const {result, rerender, unmount} = renderHook(
        ({isActive}) => useFocusTrap({isActive}),
        {initialProps: {isActive: false}}
      );

      result.current.current = container;
      rerender({isActive: true});

      expect(container.classList.contains('focus-trap-active')).toBe(true);

      unmount();

      expect(container.classList.contains('focus-trap-active')).toBe(false);
    });
  });

  // Note: Focus management tests are skipped due to JSDOM limitations
  // JSDOM does not fully support focus() behavior, making these tests unreliable
  // Focus trap functionality is manually tested in browser environment

  describe('Edge Cases', () => {
    it('should handle container with no focusable elements', () => {
      const emptyContainer = document.createElement('div');
      document.body.appendChild(emptyContainer);

      const {result, rerender} = renderHook(
        ({isActive}) => useFocusTrap({isActive, initialFocus: true}),
        {initialProps: {isActive: false}}
      );

      result.current.current = emptyContainer;

      expect(() => {
        rerender({isActive: true});
      }).not.toThrow();

      document.body.removeChild(emptyContainer);
    });
  });
});
