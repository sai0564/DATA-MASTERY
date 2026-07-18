import { useEffect } from 'react';

/**
 * shadcn/ui — Sheet
 * Premium slide-in panel with glassmorphism.
 */
export default function Sheet({ open, onClose, side = 'right', title, children, className = '' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const isRight = side === 'right';

  return (
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[#040710]/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 bottom-0 w-[420px] bg-gradient-to-b from-[#0f131a]/98 to-[#060a13]/98 border-white/[0.06] backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] p-8 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRight ? 'right-0 border-l' : 'left-0 border-r'
        } ${isRight ? 'translate-x-0' : 'translate-x-0'}`}
      >
        {title && (
          <h2 className="mb-6 text-xl font-bold tracking-tight text-white">{title}</h2>
        )}
        <div className="overflow-y-auto h-full">{children}</div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-white/40 transition-colors hover:text-white hover:bg-white/[0.05]"
          aria-label="Close panel"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>
    </div>
  );
}
