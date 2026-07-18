/**
 * Eldora UI — Font Weight Text
 * Dynamic weight transition on hover with premium typography.
 */
export default function FontWeightText({
  text,
  label,
  weight = 800,
  hoverWeight = 300,
  className = '',
}) {
  return (
    <a
      href="#"
      className={`group relative inline-block ${className}`}
      style={{ fontWeight: weight, transition: 'font-weight 0.3s ease' }}
    >
      <span
        className="inline-block bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent transition-all duration-300 group-hover:[font-weight:var(--hover-weight)] group-hover:[letter-spacing:0.04em]"
        style={{ '--hover-weight': hoverWeight }}
      >
        {text}
      </span>
      {label && (
        <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#6366f1] to-[#a78bfa] transition-transform duration-300 group-hover:scale-x-100" />
      )}
      {label && <span className="sr-only">{label}</span>}
    </a>
  );
}
