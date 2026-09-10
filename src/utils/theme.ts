/**
 * Theme Manager Utility
 * Supports Light Theme, Dark Theme, and System Preference with local persistence.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_KEY = 'app_theme_mode';

export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'light';
}

export function applyTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme in localStorage:', err);
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function initializeTheme(): ThemeMode {
  const current = getStoredTheme();
  applyTheme(current);
  return current;
}
