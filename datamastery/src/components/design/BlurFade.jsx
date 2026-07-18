import { useEffect, useState } from 'react';

/**
 * Magic UI — Blur Fade
 * Elegant text reveal with blur and opacity transition.
 */
export default function BlurFade({
  children,
  delay = 0,
  duration = 0.9,
  direction = 'up',
  className = '',
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const transforms = {
    up: 'translateY(24px)',
    down: 'translateY(-24px)',
    left: 'translateX(24px)',
    right: 'translateX(-24px)',
  };

  return (
    <div
      className={`${className}`}
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : 'blur(12px)',
        transform: visible ? 'translateY(0)' : transforms[direction] || transforms.up,
        transition: `opacity ${duration}s ease-out, filter ${duration}s ease-out, transform ${duration}s ease-out`,
      }}
    >
      {children}
    </div>
  );
}
