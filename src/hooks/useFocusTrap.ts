import {useEffect, useRef, useCallback} from 'react';

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

/**
 * Traps focus within a container element for accessibility compliance
 */
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
    const elements =
      containerRef.current.querySelectorAll<HTMLElement>(selector);

    return Array.from(elements).filter(
      (element) =>
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.hasAttribute('inert') &&
        getComputedStyle(element).visibility !== 'hidden'
    );
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
          if (event.shiftKey) {
            if (
              document.activeElement === firstElement ||
              !containerRef.current.contains(document.activeElement as Node)
            ) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (
              document.activeElement === lastElement ||
              !containerRef.current.contains(document.activeElement as Node)
            ) {
              event.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    },
    [isActive, getFocusableElements, onEscape]
  );

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;

    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    if (initialFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        const autoFocusElement = focusableElements.find((el) =>
          el.hasAttribute('autofocus')
        );
        const elementToFocus = autoFocusElement || focusableElements[0];
        setTimeout(() => elementToFocus.focus(), 0);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    if (container) {
      container.classList.add('focus-trap-active');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (container) {
        container.classList.remove('focus-trap-active');
      }

      if (restoreFocus && previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
        previouslyFocusedElementRef.current = null;
      }
    };
  }, [
    isActive,
    initialFocus,
    restoreFocus,
    handleKeyDown,
    getFocusableElements,
  ]);

  return containerRef;
}
