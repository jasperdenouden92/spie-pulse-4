'use client';

import { useEffect } from 'react';

/**
 * Hides the floating dev/feedback buttons (annotations, inspector, changelog)
 * by default. Press Shift+A to toggle them. Useful for user testing sessions
 * where these tools should not distract.
 *
 * Visibility is controlled via a `data-dev-tools` attribute on <html>; the
 * matching CSS lives in globals.css.
 */
export default function DevToolsToggle() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'A' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;

      // Ignore when the user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }

      e.preventDefault();
      const root = document.documentElement;
      const visible = root.dataset.devTools === 'visible';
      root.dataset.devTools = visible ? '' : 'visible';
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
