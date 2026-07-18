import { useEffect } from 'react';

/**
 * Magic UI — Dot Pattern
 * A subtle, premium dot grid background that creates depth
 * without overwhelming the content.
 */
export default function DotPattern({
  width = 24,
  height = 24,
  color = 'rgba(255, 255, 255, 0.08)',
  className = '',
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern
          id="dot-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={width / 2} cy={height / 2} r={1.5} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
}
