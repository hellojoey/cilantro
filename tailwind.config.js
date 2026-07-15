/** @type {import('tailwindcss').Config} */

// Semantic colors resolve to the Greenhouse tokens (src/theme/palettes.js), which
// re-tint per question vibe. `<alpha-value>` keeps opacity modifiers working
// (bg-card/60), which is why the tokens are RGB triplets rather than hex.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('bg'),
        soft: token('soft'),
        mid: token('mid'),
        accent: token('accent'),
        deep: token('deep'),
        deeper: token('deeper'),
        ink: token('ink'),
        sub: token('sub'),
        card: token('card'),
        // Mode-scoped, vibe-independent (CONSTANTS in palettes.js).
        // `negate` is a fill; `alert` is its text-weight counterpart.
        negate: token('negate'),
        alert: token('alert'),
      },
      fontFamily: {
        // Greenhouse is a rounded-geometric face; the stack degrades to the
        // platform's roundest available before hitting plain sans.
        rounded: [
          'ui-rounded', 'SF Pro Rounded', 'Nunito', 'Quicksand',
          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif',
        ],
      },
      boxShadow: {
        // Chunky offset shadows — no blur, drawn in ink. The card's weight.
        chunk: '8px 8px 0 rgb(var(--c-ink))',
        'chunk-sm': '3px 3px 0 rgb(var(--c-ink))',
        'chunk-xs': '2px 2px 0 rgb(var(--c-ink))',
        // CTA sits on a colored ledge that compresses when pressed.
        ledge: '0 6px 0 rgb(var(--c-deeper))',
        'ledge-sm': '0 4px 0 rgb(var(--c-deeper))',
      },
      borderRadius: {
        chunk: '20px',
      },
    },
  },
  plugins: [],
}
