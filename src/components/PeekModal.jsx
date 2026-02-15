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
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Peek at ${garden.name} garden`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-stone-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-slideUp"
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
            <h3 className="text-stone-700 dark:text-stone-200 font-medium">{garden.name}</h3>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-light">{garden.description}</p>
          </div>
        </div>

        {/* Preview items */}
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs mt-0.5" aria-hidden="true">{contentTypeLabel(item.contentType)}</span>
              <p className="text-sm text-stone-600 dark:text-stone-300 font-light">
                {item.text}
                {item.attribution && (
                  <span className="text-stone-400 dark:text-stone-500"> — {item.attribution}</span>
                )}
              </p>
            </div>
          ))}
          <p className="text-xs text-stone-300 dark:text-stone-500 font-light italic pl-6">
            ...and {garden.items.length - items.length} more
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-light transition-all"
          aria-label="Close preview"
        >
          close
        </button>
      </div>
    </div>
  );
}
