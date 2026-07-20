// Cilantro — garden builder.
// Each garden lives in its own JSON (src/data/gardens/*.json) as a ROOT question
// plus BRANCHES of yes/no items. Here we load them and derive the flat `items`
// list (all branch items, root excluded) so existing consumers that read
// `garden.items` keep working unchanged.

import ai from './gardens/ai.json' with { type: 'json' };
import goat from './gardens/goat.json' with { type: 'json' };
import afterlife from './gardens/afterlife.json' with { type: 'json' };
import gaza from './gardens/gaza.json' with { type: 'json' };

// Order is load-bearing: it is the display order in the gardens list.
const sources = [ai, goat, afterlife, gaza];

const withItems = (g) => ({
  ...g,
  items: (g.branches || []).flatMap((b) => b.items),
});

export const gardens = sources.map(withItems);

export const gardenById = (id) => gardens.find((g) => g.id === id) || null;

// The branch object owning a given item id (or null if not found).
export const branchOfItem = (garden, itemId) =>
  (garden?.branches || []).find((b) => b.items.some((it) => it.id === itemId)) || null;
