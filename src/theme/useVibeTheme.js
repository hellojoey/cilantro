import { useEffect } from 'react';
import { familyForVibe } from './palettes';

// Re-tints the whole scene to a question's vibe.
//
// Sets <html data-palette>, letting the generated CSS in palettes.css resolve
// the tokens. Doing it through the cascade (rather than inline styles) means the
// dark-mode class keeps working on its own — a screen that never calls this hook
// still gets a correct home-base palette in both modes.
//
// Call with no argument on screens that aren't showing a question (Profile,
// Gardens) to return to herb.
export function useVibeTheme(vibe) {
  const family = familyForVibe(vibe);
  useEffect(() => {
    document.documentElement.dataset.palette = family;
  }, [family]);
}
