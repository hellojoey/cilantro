import React, { useEffect, useRef } from 'react';

export default function PeekModal({ garden, items, onClose }) {
  const modalRef = useRef(null);

  // Focus trap + escape to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!items || !garden) return null;

  const contentTypeLabel = (type) => {
    if (type === 'quote') return '💬';
    if (type === 'vibe') return '✨';
    return '❓';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-canvas/80 backdrop-blur-sm retint animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Peek at ${garden.name} garden`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-card border-2 border-ink rounded-chunk shadow-chunk p-6 max-w-sm w-full retint animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: garden.color + '20' }}
          >
            {garden.icon}
          </div>
          <div>
            <h3 className="text-ink font-rounded font-semibold retint">{garden.name}</h3>
            <p className="text-xs text-sub retint">{garden.description}</p>
          </div>
        </div>

        {/* Preview items */}
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" aria-hidden="true">{contentTypeLabel(item.contentType)}</span>
              <p className="text-sm text-ink retint">
                {item.text}
                {item.attribution && (
                  <span className="text-sub"> — {item.attribution}</span>
                )}
              </p>
            </div>
          ))}
          <p className="text-xs text-sub italic pl-6 retint">
            ...and {garden.items.length - items.length} more
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-soft hover:bg-mid text-deep rounded-xl text-sm font-rounded font-semibold transition-all retint"
          aria-label="Close preview"
        >
          close
        </button>
      </div>
    </div>
  );
}
