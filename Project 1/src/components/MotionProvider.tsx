import React, { createContext, useContext } from 'react';
import { useReducedMotion, useAnimationConfig } from '../hooks/useReducedMotion';

/**
 * Context for providing motion preferences throughout the app
 * Supports WCAG 2.1 Level AA motion control requirements
 */
interface MotionContextType {
  prefersReducedMotion: boolean;
  animationConfig: {
    prefersReducedMotion: boolean;
    duration: number;
    easing: string;
    shouldAnimate: boolean;
    transitionStyle: React.CSSProperties;
    animationClass: string;
  };
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

/**
 * Provider component for motion preferences
 * Wraps the app to provide motion settings to all components
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const animationConfig = useAnimationConfig();

  const value: MotionContextType = {
    prefersReducedMotion,
    animationConfig,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
}

/**
 * Hook to access motion preferences from any component
 * Throws error if used outside MotionProvider
 */
export function useMotion(): MotionContextType {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
}

/**
 * Component that conditionally renders children based on motion preferences
 * Useful for wrapping animated content that should be hidden for users who prefer reduced motion
 */
export function MotionSafe({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const { prefersReducedMotion } = useMotion();
  
  return prefersReducedMotion ? fallback : children;
}

/**
 * Component that only renders for users who prefer reduced motion
 * Useful for providing alternative static content
 */
export function MotionReduced({ children }: { children: React.ReactNode }) {
  const { prefersReducedMotion } = useMotion();
  
  return prefersReducedMotion ? children : null;
}