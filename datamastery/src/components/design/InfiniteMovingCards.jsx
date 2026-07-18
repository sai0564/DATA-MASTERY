import { useRef, useEffect } from 'react';

/**
 * Aceternity UI — Infinite Moving Cards
 * Seamlessly looping cards with smooth continuous scroll.
 */
export default function InfiniteMovingCards({
  cards = [],
  direction = 'left',
  speed = 30,
  pauseOnHover = true,
  className = '',
}) {
  const rowRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    let animId;
    let offset = 0;
    const dirMult = direction === 'left' ? -1 : 1;

    const step = () => {
      offset += dirMult * 0.3;
      const first = row.children[0];
      if (!first) {
        animId = requestAnimationFrame(step);
        return;
      }
      const width = first.offsetWidth + 16; // gap included
      if (Math.abs(offset) >= width) {
        offset = 0;
        row.appendChild(row.removeChild(row.firstChild));
      }
      row.style.transform = `translateX(${offset}px)`;
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [direction]);

  const defaultCards = [
    { title: 'Real Python', desc: 'Run actual Pandas & NumPy in the browser.', icon: '🐍', accent: '#3776ab' },
    { title: 'Story Driven', desc: 'Every task is a workplace scenario with stakes.', icon: '📖', accent: '#8b5cf6' },
    { title: 'Instant Feedback', desc: 'Results validated in real-time by Maya.', icon: '⚡', accent: '#f59e0b' },
    { title: 'Track Progress', desc: 'Earn DP, unlock achievements, build your career.', icon: '🏆', accent: '#10b981' },
  ];

  const items = cards.length ? cards : defaultCards;

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        ref={rowRef}
        className={`flex gap-4 ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ willChange: 'transform' }}
      >
        {items.map((card, i) => (
          <div
            key={`${card.title}-${i}`}
            className="flex-shrink-0 w-[280px] rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-white/[0.005] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.1] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          >
            <div className="mb-4 text-2xl">{card.icon}</div>
            <h3 className="mb-2 text-base font-bold text-white">{card.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{card.desc}</p>
            <div className="mt-4 h-0.5 w-8 rounded-full opacity-40" style={{ background: card.accent }} />
          </div>
        ))}
      </div>
    </div>
  );
}
