import { motion } from 'framer-motion';

/**
 * Eldora UI — Animated Badge
 * A premium animated status badge with shimmer effect.
 */
export default function AnimatedBadge({
  text,
  icon,
  color = '#6366f1',
  shimmer = true,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/[0.08] bg-gradient-to-r from-white/[0.03] to-white/[0.01] px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-lg ${className}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span className="relative z-10 text-white/90">{text}</span>
      {shimmer && (
        <span
          className="absolute inset-0 z-0 animate-shimmer"
          style={{
            background: `linear-gradient(120deg, transparent 30%, ${color}20 50%, transparent 70%)`,
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </motion.div>
  );
}
