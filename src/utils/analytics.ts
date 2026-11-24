declare global {
  interface Window {
    goatcounter?: {
      count: (opts: { path?: string; title?: string; event?: boolean }) => void;
    };
  }
}

/**
 * Lightweight privacy-friendly analytics (GoatCounter).
 * Activated only when VITE_GOATCOUNTER_CODE is configured at build time.
 */
export function initAnalytics(): void {
  const code = import.meta.env.VITE_GOATCOUNTER_CODE?.trim();
  if (!code || typeof document === 'undefined') return;

  if (document.querySelector('script[data-goatcounter]')) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.setAttribute('data-goatcounter', `https://${code}.goatcounter.com/count`);
  document.head.appendChild(script);
}

export function trackEvent(name: string, title?: string): void {
  if (typeof window === 'undefined' || !window.goatcounter) return;
  window.goatcounter.count({
    path: `event/${name}`,
    title: title ?? name,
    event: true,
  });
}
