import { useRef, useEffect } from 'react';

/**
 * Magic UI — Marquee
 * Continuous scrolling text or elements for premium editorial feel.
 */
export default function Marquee({
  children,
  direction = 'left',
  speed = 25,
  pauseOnHover = true,
  className = '',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = (direction === 'left' ? -1 : 1) * 0.5;
    let animationId;
    let offset = 0;

    const animate = () => {
      offset += scrollAmount;
      if (container.children.length > 0) {
        const firstChild = container.children[0];
        const childWidth = firstChild.offsetWidth;
        if (Math.abs(offset) >= childWidth) {
          offset = 0;
          container.appendChild(firstChild);
        }
      }
      container.style.transform = `translateX(${offset}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [direction]);

  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}
    >
      <div
        ref={containerRef}
        className={`inline-flex gap-8 ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
        style={{ willChange: 'transform' }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
