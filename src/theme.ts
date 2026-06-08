export type Theme = 'light' | 'dark' | 'fun'

const KEY = 'trips-tracker:theme'

const THEME_COLOR: Record<Theme, string> = {
  light: '#f8fafc',
  dark: '#0b1220',
  fun: '#fdf4ff',
}

export function loadTheme(): Theme {
  const stored = localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'fun') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme)
}

export function nextTheme(theme: Theme): Theme {
  if (theme === 'light') return 'dark'
  if (theme === 'dark') return 'fun'
  return 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
}
