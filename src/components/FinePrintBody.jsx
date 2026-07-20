import React from 'react';

// The body of an expanded fine-print panel. Renders the one-line clarifier
// exactly as before, then — only for sourced entries — the longer notes
// paragraphs and a quiet sources list beneath. A footnote layer, never a
// billboard: tiny type, house retint, text-sub/opacity patterns, no new colors.
//
// `fp` is the normalized shape from resolveFinePrint: { note, notes, sources }.
// `noteClass` lets each card keep its existing clarifier styling (the two cards
// differ only in the clarifier's type size), so string entries render as today.
export default function FinePrintBody({ fp, noteClass }) {
  if (!fp) return null;
  const { note, notes, sources } = fp;
  const paragraphs = notes
    ? notes.split('\n\n').map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <>
      {note && <p className={noteClass}>{note}</p>}

      {paragraphs.length > 0 && (
        <div className="mt-3 space-y-2 text-left">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-xs text-sub leading-relaxed retint">
              {p}
            </p>
          ))}
        </div>
      )}

      {sources.length > 0 && (
        <div className="mt-4 text-left">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sub opacity-55 font-rounded font-semibold mb-2">
            sources
          </p>
          <ul className="space-y-2">
            {sources.map((s, i) => (
              <li key={i} className="text-xs leading-relaxed">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-deep font-rounded font-semibold underline underline-offset-2 hover:opacity-75 transition-opacity retint"
                >
                  {s.title}
                </a>
                {s.publisher && <span className="text-sub"> · {s.publisher}</span>}
                {s.perspective && (
                  <p className="text-[11px] text-sub opacity-70 leading-snug mt-0.5 retint">
                    {s.perspective}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
