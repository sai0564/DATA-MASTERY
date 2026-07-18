import { useState } from 'react';

/**
 * Magic UI — Magic Card
 * A glassmorphic card with ambient glow and smooth hover interaction.
 */
export default function MagicCard({
  children,
  className = '',
  glowColor = 'rgba(99, 102, 241, 0.25)',
  hoverScale = 1.01,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-white/[0.005] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${className}`}
      style={{
        boxShadow: isHovered
          ? `0 24px 48px rgba(0,0,0,0.35), 0 0 40px ${glowColor}`
          : '0 8px 24px rgba(0,0,0,0.2)',
        transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10 p-8">{children}</div>
      {/* Ambient glow layer */}
      <div
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at 50% 50%, ${glowColor}, transparent 70%)`,
          opacity: isHovered ? 0.6 : 0,
        }}
      />
    </div>
  );
}
