import React from 'react';
import { useReducedMotion, useAnimationConfig } from '../hooks/useReducedMotion';
import { MotionContext, type MotionContextType } from '../contexts/MotionContext';
import { useMotion } from '../hooks/useMotion';

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