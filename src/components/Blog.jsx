import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { gardens } from '../data/questions';

// Garden lookup so a topic that is a garden id renders with its icon + name,
// and its chip can link back to the garden.
const gardenById = new Map(gardens.map((g) => [g.id, g]));

// Format 'YYYY-MM-DD' as a quiet, lowercase date line.
function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toLowerCase();
}

// A single topic chip. Garden topics show icon + name and link to the garden;
// free-tag topics render as a plain, non-linking chip.
function TopicChip({ topic }) {
  const garden = gardenById.get(topic);
  const className =
    'inline-flex items-center gap-1 text-xs font-rounded font-semibold px-2 py-0.5 rounded-full bg-soft text-deep retint';

  if (garden) {
    return (
      <Link
        to={`/gardens/${garden.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`${className} opacity-55 hover:opacity-100 transition-opacity`}
        aria-label={`Garden: ${garden.name}`}
      >
        <span aria-hidden="true">{garden.icon}</span>
        <span>{garden.name}</span>
      </Link>
    );
  }

  return <span className={className}>{topic}</span>;
}

export default function Blog() {
  const navigate = useNavigate();

  // Newest-first by date.
  const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint"
            aria-label="Go back"
          >
            ← back
          </button>
          <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">blog</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto space-y-6">
          {posts.length === 0 ? (
            <div className="text-center pt-16">
              <div className="text-4xl mb-4">🌿</div>
              <p className="text-sub">nothing written yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <button
                key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="w-full text-left bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6 hover:shadow-chunk-sm transition-shadow"
                aria-label={`Read: ${post.title}`}
              >
                <h2 className="text-lg font-rounded font-semibold text-ink leading-snug">{post.title}</h2>
                <p className="text-xs text-sub mt-1">{formatDate(post.date)}</p>
                {post.intro && (
                  <p className="text-sm text-sub leading-relaxed mt-3">{post.intro}</p>
                )}
                {post.topics && post.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.topics.map((topic) => (
                      <TopicChip key={topic} topic={topic} />
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
