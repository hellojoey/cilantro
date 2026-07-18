import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { getPost } from '../data/blog';

// Format 'YYYY-MM-DD' as a quiet, lowercase date line.
function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toLowerCase();
}

export default function BlogPost() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const post = getPost(slug);

  // Unknown slug → back to the blog list.
  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/blog')}
            className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint"
            aria-label="Back to blog"
          >
            ← blog
          </button>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <article className="max-w-sm mx-auto">
          <h1 className="text-2xl font-rounded font-semibold text-deep leading-snug retint">{post.title}</h1>
          <p className="text-xs text-sub mt-1">{formatDate(post.date)}</p>

          {post.intro && (
            <p className="text-base text-ink leading-relaxed mt-5">{post.intro}</p>
          )}

          {post.sections && post.sections.length > 0 && (
            <div className="mt-6 space-y-6">
              {post.sections.map((section, i) => (
                <section key={i}>
                  {section.heading && (
                    <h2 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-3">
                      {section.heading}
                    </h2>
                  )}
                  <div className="space-y-4">
                    {(section.paragraphs || []).map((para, j) => (
                      <p key={j} className="text-sm text-ink leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {post.sources && post.sources.length > 0 && (
            <div className="mt-8 pt-5 border-t border-mid">
              <h2 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-3">
                sources
              </h2>
              <ul className="space-y-2">
                {post.sources.map((source, i) => (
                  <li key={i} className="text-sm leading-snug">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink underline decoration-mid underline-offset-2 hover:text-deep transition-colors"
                    >
                      {source.title}
                    </a>
                    {source.publisher && <span className="text-xs text-sub"> — {source.publisher}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
