# Cilantro Question Bank — How It Works

The question bank is **2,000 yes/no questions** split across 8 category files in
`src/data/questions/*.json`, loaded by `src/data/questions.js`. There is no
database — the JSON files ARE the database, and Vercel ships them with the app.

## Anatomy of a question

```json
{ "id": "deep-042", "text": "Are you afraid of being ordinary?", "vibe": "fear", "difficulty": 3 }
```

| Field | Meaning |
|-------|---------|
| `id` | `{category-slug}-{NNN}`, stable forever. Never renumber — answers and contradiction pairs reference these. |
| `text` | Second person, literally yes/no answerable, under ~90 chars, ends with `?` |
| `vibe` | Must be a key of `src/data/vibe-dimensions.json` — this is how answers feed the radar chart |
| `difficulty` | 1 easy · 2 takes honesty · 3 hard truth. Also sets seeds earned. |

## The pipeline

```bash
npm run questions:validate   # schema, duplicate ids/texts, vibe coverage, contradiction pairs
npm run questions:stats      # counts per category/difficulty/vibe, radar coverage
```

Validation runs over every category file plus `src/data/contradictions.json`
(the curated pairs that power Mirror Moments). It must pass before committing.

## Adding questions

**The easy way:** in Claude Code, run `/addquestions 50 [topic]` — Claude picks the
right category file, follows the house style, continues the id sequence, validates,
and shows you a sample before committing.

**By hand:** append to the right category file's `questions` array, continue the id
sequence, then run `npm run questions:validate`.

## Adding contradiction pairs (Mirror Moments)

`src/data/contradictions.json` holds curated pairs of questions whose answers can
form a meaningful tension:

```json
{
  "a": "deep-005", "aText": "Are you being honest with yourself?",
  "b": "deep-013", "bText": "Have you been avoiding a truth about yourself?",
  "conflict": [["yes", "yes"]],
  "note": "You say you're honest with yourself, yet there's a truth you're avoiding."
}
```

`conflict` lists the [answerA, answerB] combos that fire the moment. `aText`/`bText`
must match the bank exactly (validator enforces this — it also catches renamed ids).

## House style

- Calm, gentle, curious — never judgmental, never hustle-culture
- Vary stems: Did you / Have you / Are you / Do you / Is there / Would you / Can you
- Mix timeframes: today, this week, recently, timeless
- Nothing crisis-adjacent, no shaming, wholesome mischief only
