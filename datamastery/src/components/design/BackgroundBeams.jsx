import { useEffect, useRef } from 'react';

/**
 * Aceternity UI — Background Beams
 * Elegant light beams that sweep across the background with subtle motion.
 */
export default function BackgroundBeams({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame;
    let beams = [
      { x: 0.2, y: 0.1, width: 300, speed: 0.003, color: 'rgba(99, 102, 241, 0.08)' },
      { x: 0.7, y: 0.3, width: 400, speed: 0.002, color: 'rgba(139, 92, 246, 0.06)' },
      { x: 0.4, y: 0.6, width: 250, speed: 0.004, color: 'rgba(168, 139, 250, 0.05)' },
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      beams.forEach((beam) => {
        const cx = beam.x * canvas.width + Math.sin(time * beam.speed) * 100;
        const cy = beam.y * canvas.height + Math.cos(time * beam.speed * 0.7) * 50;

        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, beam.width);
        grd.addColorStop(0, beam.color);
        grd.addColorStop(0.4, beam.color.replace('0.08', '0.04').replace('0.06', '0.03').replace('0.05', '0.02'));
        grd.addColorStop(1, 'transparent');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 h-full w-full z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
