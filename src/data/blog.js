// Cilantro — Blog Data
// Repo content, like everything else in this app: no CMS, no markdown parser.
// Each post is a structured JS object so rendering needs zero dependencies.
//
// Post shape:
//   {
//     slug: 'kebab-case-unique',
//     title: string,
//     date: 'YYYY-MM-DD',
//     topics: [...garden ids or free tag strings],   // garden ids: ai, goat, afterlife, gaza
//     intro: string,
//     sections: [{ heading?: string, paragraphs: [string, ...] }],
//     sources?: [{ title, publisher, url }],
//   }
//
// Newest-first ordering is handled at render time by date, so posts can live
// here in any order.

export const blogPosts = [
  {
    slug: 'hello',
    title: 'a first note',
    date: '2026-07-17',
    topics: [],
    intro: 'a placeholder, so the shelf is not empty.',
    sections: [
      {
        paragraphs: [
          'this is where joey will write through the gardens’ topics — ai, the goat, life after death, the war on gaza — and the research behind them. easy questions help you answer hard questions; the notes are for the hard part.',
        ],
      },
    ],
  },
];

// ── Helpers ──

// Posts whose `topics` array includes the given topic (garden id or tag string).
export const getPostsByTopic = (topic) =>
  blogPosts.filter((post) => Array.isArray(post.topics) && post.topics.includes(topic));

// Single post by slug, or undefined if none matches.
export const getPost = (slug) => blogPosts.find((post) => post.slug === slug);
