'use client';

import { useEffect } from 'react';

interface DarkModeScriptProps {
  darkMode: boolean;
}

/**
 * Client component that applies the dark mode class to the <html> element.
 * This bridges the server-fetched preference to the DOM since the (app) layout
 * cannot directly modify the root <html> element rendered by the root layout.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */
export function DarkModeScript({ darkMode }: DarkModeScriptProps) {
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  return null;
}
