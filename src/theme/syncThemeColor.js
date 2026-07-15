// Keeps <meta name="theme-color"> in step with the active palette.
//
// On mobile — and especially in the installed PWA — this meta tag paints the
// browser/status-bar chrome around the app. Left static it would sit on the herb
// home-base color while the scene re-tinted to slate or plum underneath, so the
// chrome and the page would visibly disagree. Reading the resolved token means
// this needs no knowledge of which family or mode is active.
//
// Called from useVibeTheme (vibe changes) and from CilantroContext (dark-mode
// toggles) — the two places that can change what --c-bg resolves to.
export function syncThemeColor() {
  if (typeof document === 'undefined') return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  // getComputedStyle forces a style recalc, so this is correct even when called
  // immediately after the palette attribute or dark class is written.
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim();
  if (bg) meta.setAttribute('content', `rgb(${bg})`);
}
