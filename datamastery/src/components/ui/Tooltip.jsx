import { useState } from 'react';

/**
 * shadcn/ui — Tooltip
 * Elegant tooltip with glassmorphism and arrow.
 */
export default function Tooltip({ children, content, delay = 300, className = '' }) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const handleMouseEnter = () => {
    const t = setTimeout(() => setVisible(true), delay);
    setTimer(t);
  };

  const handleMouseLeave = () => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        className={`absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#0f131a]/95 to-[#060a13]/95 px-3 py-2 text-xs font-medium text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/[0.06] bg-[#060a13]/95" />
        {content}
      </div>
    </div>
  );
}
