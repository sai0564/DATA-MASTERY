import { useEffect } from 'react';

/**
 * shadcn/ui — Dialog
 * Accessible modal dialog with premium glassmorphism styling.
 */
export default function Dialog({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-[#040710]/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full max-w-lg rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0f131a]/95 to-[#060a13]/95 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6),0_0_40px_rgba(99,102,241,0.15)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300 ${className}`}>
        {title && (
          <h2 id="dialog-title" className="mb-6 text-xl font-bold tracking-tight text-white">{title}</h2>
        )}
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-white/40 transition-colors hover:text-white hover:bg-white/[0.05]"
          aria-label="Close dialog"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
