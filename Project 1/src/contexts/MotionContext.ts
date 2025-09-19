import { createContext } from 'react';

/**
 * Context for providing motion preferences throughout the app
 * Supports WCAG 2.1 Level AA motion control requirements
 */
export interface MotionContextType {
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

export const MotionContext = createContext<MotionContextType | undefined>(undefined);