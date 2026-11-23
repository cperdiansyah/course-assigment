import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'color-scheme';

function getSystemDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredOverride(): 'light' | 'dark' | null {
  try {
    const val = localStorage.getItem(THEME_KEY);
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

function applyThemeToDOM(override: 'light' | 'dark' | null, systemDark: boolean) {
  const isDark = override ? override === 'dark' : systemDark;
  document.documentElement.classList.toggle('dark', isDark);
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', override ?? 'light dark');
  }
}

export function useTheme() {
  const [override, setOverride] = useState<'light' | 'dark' | null>(() => getStoredOverride());
  const [systemDark, setSystemDark] = useState<boolean>(() => getSystemDark());

  const isDark = override ? override === 'dark' : systemDark;

  useEffect(() => {
    applyThemeToDOM(override, systemDark);
  }, [override, systemDark]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMqChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onMqChange);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) {
        setOverride(getStoredOverride());
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mq.removeEventListener('change', onMqChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const currentlyDark = override ? override === 'dark' : systemDark;
    const target: 'light' | 'dark' = currentlyDark ? 'light' : 'dark';
    const systemTarget: 'light' | 'dark' = systemDark ? 'dark' : 'light';

    if (target === systemTarget) {
      try {
        localStorage.removeItem(THEME_KEY);
      } catch {
        // ignore
      }
      setOverride(null);
    } else {
      try {
        localStorage.setItem(THEME_KEY, target);
      } catch {
        // ignore
      }
      setOverride(target);
    }
  }, [override, systemDark]);

  return { isDark, override, toggleTheme };
}
