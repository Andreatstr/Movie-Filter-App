import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user preference for reduced motion
 * Provides React-level support beyond CSS media queries
 * Supports WCAG 2.1 Level AA requirements for motion control
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the browser supports matchMedia
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // Set initial value
      setPrefersReducedMotion(mediaQuery.matches);

      // Create change handler
      const handleChange = (event: MediaQueryListEvent) => {
        setPrefersReducedMotion(event.matches);
      };

      // Add listener for changes
      mediaQuery.addEventListener('change', handleChange);

      // Cleanup listener on unmount
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to provide animation configuration based on motion preferences
 * Returns appropriate animation settings for components
 */
export function useAnimationConfig() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : 300,
    easing: prefersReducedMotion ? 'linear' : 'ease-in-out',
    shouldAnimate: !prefersReducedMotion,
    // For CSS-in-JS or inline styles
    transitionStyle: prefersReducedMotion 
      ? { transition: 'none' }
      : { transition: 'all 0.3s ease-in-out' },
    // For conditional animation classes
    animationClass: prefersReducedMotion ? '' : 'animate',
  };
}