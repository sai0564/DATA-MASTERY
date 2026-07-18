import { useState, useRef, useEffect } from 'react';

/**
 * shadcn/ui — Dropdown
 * Premium dropdown menu with glassmorphism items.
 */
export default function Dropdown({ trigger, items, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent px-4 py-2 text-sm font-medium text-white/80 transition-all hover:border-white/[0.12] hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]"
      >
        {trigger}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2.5 4.5L6 8l3.5-3.5" />
        </svg>
      </button>
      <div
        className={`absolute top-full right-0 mt-2 w-56 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f131a]/98 to-[#060a13]/98 p-2 shadow-[0_24px_48px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-200 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              setOpen(false);
              item.onClick?.();
            }}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition-all hover:bg-white/[0.04] hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
