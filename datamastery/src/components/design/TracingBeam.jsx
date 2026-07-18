import { useEffect, useRef, useState } from 'react';

/**
 * Aceternity UI — Tracing Beam
 * A bright tracing beam that follows mouse movement with premium glow.
 */
export default function TracingBeam({ className = '', children }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsActive(true);
    };

    const handleLeave = () => setIsActive(false);

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMove);
      el.addEventListener('mouseleave', handleLeave);
    }

    return () => {
      if (el) {
        el.removeEventListener('mousemove', handleMove);
        el.removeEventListener('mouseleave', handleLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Tracing beam glow */}
      <div
        className="pointer-events-none absolute z-0 transition-opacity duration-300"
        style={{
          opacity: isActive ? 0.6 : 0,
          left: position.x - 200,
          top: position.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
