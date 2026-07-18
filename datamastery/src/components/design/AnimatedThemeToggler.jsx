import { useState } from 'react';

/**
 * Magic UI — Animated Theme Toggler
 * A sleek toggle that transitions smoothly between states.
 */
export default function AnimatedThemeToggler({
  onToggle,
  initial = false,
  labelOn = 'Light',
  labelOff = 'Dark',
  className = '',
}) {
  const [active, setActive] = useState(initial);

  const handleClick = () => {
    const next = !active;
    setActive(next);
    if (onToggle) onToggle(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] px-4 py-2.5 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] ${className}`}
      aria-label={`Toggle theme: ${active ? labelOn : labelOff}`}
      aria-pressed={active}
    >
      <span
        className={`relative z-10 text-xs font-semibold tracking-wide transition-colors duration-300 ${
          active ? 'text-white' : 'text-white/40'
        }`}
      >
        {labelOff}
      </span>
      <div
        className="relative h-6 w-10 rounded-full bg-gradient-to-r from-[#6366f1]/30 to-[#8b5cf6]/30 p-0.5 transition-all duration-500"
        style={{
          boxShadow: active ? '0 0 12px rgba(99, 102, 241, 0.5)' : 'inset 0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="h-4 w-4 rounded-full bg-gradient-to-br from-[#818cf8] to-[#a78bfa] shadow-[0_2px_8px_rgba(99,102,241,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: active ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </div>
      <span
        className={`relative z-10 text-xs font-semibold tracking-wide transition-colors duration-300 ${
          !active ? 'text-white' : 'text-white/40'
        }`}
      >
        {labelOn}
      </span>
    </button>
  );
}
