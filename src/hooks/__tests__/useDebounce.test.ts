import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {useDebounce} from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const {result} = renderHook(() => useDebounce('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes with default delay', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 500),
        {initialProps: {value: 'initial'}}
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({value: 'changed'});

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Fast forward time to trigger debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now value should be updated
      expect(result.current).toBe('changed');
    });

    it('should use custom delay when provided', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 1000),
        {initialProps: {value: 'initial'}}
      );

      rerender({value: 'changed'});

      // Should not change after 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current).toBe('initial');

      // Should change after 1000ms
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current).toBe('changed');
    });
  });

  describe('Debouncing Behavior', () => {
    it('should reset timer on rapid value changes', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 500),
        {initialProps: {value: 'initial'}}
      );

      // Change value rapidly
      rerender({value: 'change1'});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      rerender({value: 'change2'});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      rerender({value: 'final'});

      // Should still be initial after partial delays
      expect(result.current).toBe('initial');

      // Complete the debounce for the final value
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('final');
    });

    it('should handle multiple rapid changes correctly', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: 'start'}}
      );

      // Simulate typing
      const changes = ['s', 'se', 'sea', 'sear', 'searc', 'search'];

      changes.forEach((value) => {
        rerender({value});

        // Advance time but not enough to trigger debounce
        act(() => {
          vi.advanceTimersByTime(100);
        });

        // Should still be the initial value
        expect(result.current).toBe('start');
      });

      // Now advance enough time to trigger debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should have the final value
      expect(result.current).toBe('search');
    });
  });

  describe('Different Value Types', () => {
    it('should work with numbers', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: 0}}
      );

      rerender({value: 42});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(42);
    });

    it('should work with booleans', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: false}}
      );

      rerender({value: true});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(true);
    });

    it('should work with objects', () => {
      const initialObj = {name: 'initial'};
      const changedObj = {name: 'changed'};

      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: initialObj}}
      );

      rerender({value: changedObj});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(changedObj);
    });

    it('should work with arrays', () => {
      const initialArr = [1, 2, 3];
      const changedArr = [4, 5, 6];

      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: initialArr}}
      );

      rerender({value: changedArr});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(changedArr);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero delay', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 0),
        {initialProps: {value: 'initial'}}
      );

      rerender({value: 'changed'});

      // With zero delay, should update immediately
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe('changed');
    });

    it('should handle negative delay', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, -100),
        {initialProps: {value: 'initial'}}
      );

      rerender({value: 'changed'});

      // Negative delay should be treated as 0
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe('changed');
    });

    it('should handle undefined values', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: undefined as string | undefined}}
      );

      expect(result.current).toBeUndefined();

      rerender({value: 'defined'});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('defined');
    });

    it('should handle null values', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 300),
        {initialProps: {value: null as string | null}}
      );

      expect(result.current).toBeNull();

      rerender({value: 'not null'});

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe('not null');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const {rerender, unmount} = renderHook(
        ({value}) => useDebounce(value, 500),
        {initialProps: {value: 'initial'}}
      );

      rerender({value: 'changed'});

      // Unmount before timeout completes
      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should not update state after unmount', () => {
      const {rerender, unmount} = renderHook(
        ({value}) => useDebounce(value, 500),
        {initialProps: {value: 'initial'}}
      );

      rerender({value: 'changed'});

      // Unmount before timeout
      unmount();

      // Try to advance time - should not cause issues
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // This test mainly ensures no errors are thrown
    });
  });

  describe('Performance', () => {
    it('should not create new timeouts if value does not change', () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      const {rerender} = renderHook(({value}) => useDebounce(value, 500), {
        initialProps: {value: 'same'},
      });

      const initialCallCount = setTimeoutSpy.mock.calls.length;

      // Rerender with same value
      rerender({value: 'same'});
      rerender({value: 'same'});
      rerender({value: 'same'});

      // Should not create additional timeouts
      expect(setTimeoutSpy.mock.calls.length).toBe(initialCallCount);

      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
    });

    it('should handle frequent value changes efficiently', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 100),
        {initialProps: {value: 'initial'}}
      );

      // Simulate very frequent changes
      for (let i = 0; i < 100; i++) {
        rerender({value: `value-${i}`});
        act(() => {
          vi.advanceTimersByTime(50); // Less than debounce delay
        });
      }

      // Should still be initial value
      expect(result.current).toBe('initial');

      // Complete the debounce
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should have the final value
      expect(result.current).toBe('value-99');
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should work with search input pattern', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 400),
        {initialProps: {value: ''}}
      );

      // Simulate user typing "batman"
      const typingSequence = ['b', 'ba', 'bat', 'batm', 'batma', 'batman'];

      typingSequence.forEach((value) => {
        rerender({value});

        // User types every 100ms
        act(() => {
          vi.advanceTimersByTime(100);
        });

        // Should not trigger during typing
        expect(result.current).toBe('');
      });

      // After user stops typing for 400ms
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(result.current).toBe('batman');
    });

    it('should work with filter changes pattern', () => {
      const {result, rerender} = renderHook(
        ({value}) => useDebounce(value, 200),
        {initialProps: {value: {genre: null as string | null, rating: 0}}}
      );

      // User adjusts filters rapidly
      rerender({value: {genre: 'action', rating: 0}});

      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({value: {genre: 'action', rating: 7}});

      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({value: {genre: 'action', rating: 8}});

      // Should not have updated during rapid changes
      expect(result.current).toEqual({genre: null, rating: 0});

      // After debounce delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toEqual({genre: 'action', rating: 8});
    });
  });
});
