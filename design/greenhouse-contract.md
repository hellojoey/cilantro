# Greenhouse styling contract

The binding rules for restyling Cilantro screens onto the Greenhouse theme (v4, Phase D).
Visual spec: `design/concepts.html`, concept **c2**. Token source: `src/theme/palettes.js`.

This is a **restyle only**. Behavior, props, state, routing, copy, and accessibility
attributes must not change. If a change looks like it improves logic, leave it and
report it instead.

---

## 1. Color: semantic tokens only

Use only these Tailwind color names. They resolve to CSS custom properties that
re-tint per question vibe:

| Token | Use for |
|---|---|
| `canvas` | page background; text *on* a `deep` fill |
| `card` | card / panel surfaces |
| `ink` | primary text, card borders, chunky shadows |
| `sub` | secondary / muted text |
| `deep` | headings, wordmark, CTA fill, chip labels |
| `deeper` | CTA ledge shadow only |
| `accent` | shapes, dots, small emphasis |
| `soft` | tinted fills (vibe chip, tag pill) |
| `mid` | stronger tint: borders, "yes" hover |
| `negate` | **background only** — "no" hover, error banner fill |
| `alert` | negative status **text** (a spend, a refusal, an error message) |

### `negate` is a fill; `alert` is the text

`negate` is a near-canvas tint. It is legible only *underneath* `ink` — `text-negate`
is invisible on the canvas. If a negative status needs to be read as words, use
`text-alert`. Both are vibe-independent (they only change with light/dark), so a
rejection never reads warmer or cooler depending on the question's topic.

```jsx
// ✅ error banner: alert text on a negate fill, or ink on a negate fill
<div className="bg-negate text-ink" role="alert">
<span className="text-alert">-3</span>

// ❌ negate as text — pale pink on a pale canvas
<span className="text-negate">-3</span>
```

`accent` is a **shape** color (~2.3:1 on canvas). Don't use it for text either.

**Banned in restyled markup:** `stone-*`, `amber-*`, `emerald-*`, `rose-*`, any other
Tailwind palette color, and any raw hex or `rgb()`. If you need a color that isn't
in the table, stop and report it — do not invent one.

Opacity modifiers work (`bg-card/60`, `text-sub/80`).

### ⚠️ Do not write `dark:` variants for palette colors

The tokens already resolve per mode. `bg-card` **is** the dark surface in dark mode.
Writing `bg-card dark:bg-stone-800` breaks the system and reintroduces the old palette.

```jsx
// ✅ correct — one class, correct in both modes
<div className="bg-card text-ink border-2 border-ink">

// ❌ wrong — dark: variant fights the token
<div className="bg-card dark:bg-stone-800 text-ink dark:text-stone-200">
```

The only legitimate `dark:` use is for something genuinely outside the token
system. That should be rare; report it if you hit one.

## 2. The `retint` class

Any element painted from a token should carry `retint`, so it crossfades when the
palette changes instead of snapping. Add it to cards, chips, buttons, and panels.
`body` already handles the page background. `retint` is defined in `index.css` and
is disabled automatically under `prefers-reduced-motion`.

## 3. Shape language

- **Card:** `bg-card border-2 border-ink rounded-chunk shadow-chunk retint`
- **Small card / thumbnail:** `border-2 border-ink rounded-xl shadow-chunk-sm retint`,
  hover `hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs`
- **Primary CTA:** `bg-deep text-canvas font-rounded font-semibold rounded-[18px]
  px-11 py-4 shadow-ledge retint`, hover `hover:translate-y-[2px] hover:shadow-ledge-sm`
- **Yes / No buttons:** `border-2 border-ink bg-card text-ink rounded-[14px]
  font-rounded font-bold retint`; `yes` hover → `hover:bg-mid`, `no` hover → `hover:bg-negate`
- **Vibe chip:** `bg-soft text-deep font-bold rounded-full px-3 py-1 text-xs retint`
- **Tag pill:** `bg-soft text-deep font-bold rounded-full px-2.5 py-0.5 text-[11px] retint`
- **Quiet / tertiary action (skip):** no border, no fill — `text-sub text-xs font-rounded
  font-semibold opacity-55 hover:opacity-100`

## 4. Typography

- `font-rounded` on: wordmark, headings, question text, buttons, chips, garden names.
- Question text is `font-rounded font-semibold text-ink` — **not** the old
  `font-light` treatment.
- Body copy and fine-print prose stay default weight; use `text-sub` for them.
- Keep existing responsive size classes (`text-2xl md:text-3xl`) unless they
  conflict with the spec.

## 5. Accessibility — non-negotiable

- Preserve every `aria-*`, `role`, `alt`, and `aria-label` already present.
- Preserve focus states. `:focus-visible` is styled globally; don't add `outline-none`.
- Keep hit targets at their current size or larger.
- Never encode meaning in color alone — the yes/no buttons keep their text labels.
- Contrast is already validated for token pairs (`npm run theme:validate`). Don't
  invent new fg/bg pairings outside the documented ones — e.g. `text-sub` on
  `bg-soft` is **not** a validated pair.

## 6. Seeing it

`npm run dev` → **http://localhost:5173/preview.html** renders the real QuestionCard
against the real question bank: every palette family, light and dark, with fine print,
resurfaced notes, and echoes. No login needed (the app's own question flow is behind an
auth guard). Dev-server only — it never reaches production.

## 7. Verify before reporting

```bash
npm run build          # must pass
npm run theme:validate # must pass
```

Then grep your own diff for banned colors:

```bash
grep -nE 'stone-|amber-|emerald-|rose-|#[0-9a-fA-F]{3,6}|dark:' <files you changed>
```

Expect zero hits. Report anything you deliberately left in and why.
