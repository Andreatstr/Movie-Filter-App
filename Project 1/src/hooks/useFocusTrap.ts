/**
 * Focus Trap Hook for Modal-like Interactions
 * WCAG 2.1 Level AA Compliance
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocus?: boolean;
  restoreFocus?: boolean;
  onEscape?: () => void;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
] as const;

export function useFocusTrap({
  isActive,
  initialFocus = true,
  restoreFocus = true,
  onEscape,
}: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    
    const selector = FOCUSABLE_ELEMENTS.join(', ');
    const elements = containerRef.current.querySelectorAll<HTMLElement>(selector);
    
    return Array.from(elements).filter(element => {
      // Additional checks for truly focusable elements
      return (
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('inert') &&
        getComputedStyle(element).visibility !== 'hidden'
      );
    });
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      case 'Tab':
        // Trap tab navigation within the container
        if (event.shiftKey) {
          // Shift + Tab: moving backwards
          if (document.activeElement === firstElement || !containerRef.current.contains(document.activeElement as Node)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: moving forwards
          if (document.activeElement === lastElement || !containerRef.current.contains(document.activeElement as Node)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
        break;

      default:
        break;
    }
  }, [isActive, getFocusableElements, onEscape]);

  // Activate focus trap
  useEffect(() => {
    if (!isActive) return;

    // Capture container ref at the start of the effect
    const container = containerRef.current;

    // Store the currently focused element to restore later
    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    // Set initial focus
    if (initialFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Look for an element with autofocus, otherwise use the first focusable element
        const autoFocusElement = focusableElements.find(el => el.hasAttribute('autofocus'));
        const elementToFocus = autoFocusElement || focusableElements[0];
        
        // Use setTimeout to ensure the element is rendered and focusable
        setTimeout(() => elementToFocus.focus(), 0);
      }
    }

    // Add event listener for keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

    // Add class to container for styling
    if (container) {
      container.classList.add('focus-trap-active');
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      if (container) {
        container.classList.remove('focus-trap-active');
      }

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
    };
  }, [isActive, initialFocus, restoreFocus, handleKeyDown, getFocusableElements]);

  return containerRef;
}

/**
 * Hook for managing focus on mount/unmount
 * Useful for components that should receive focus when they appear
 */
export function useAutoFocus(shouldFocus: boolean = true) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
    }
  }, [shouldFocus]);

  return elementRef;
}

/**
 * Hook for managing focus restoration
 * Automatically restores focus to the previously focused element when component unmounts
 */
export function useFocusRestore() {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the currently focused element
    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    // Restore focus on cleanup
    return () => {
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, []);

  return previouslyFocusedElementRef;
}