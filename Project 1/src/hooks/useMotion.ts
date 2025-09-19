import { useContext } from 'react';
import { MotionContext, type MotionContextType } from '../contexts/MotionContext';

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