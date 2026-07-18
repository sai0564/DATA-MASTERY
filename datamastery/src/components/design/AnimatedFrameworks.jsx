import { motion } from 'framer-motion';

/**
 * Eldora UI — Animated Frameworks
 * Animated tech stack icons with staggered entrance.
 */
export default function AnimatedFrameworks({
  frameworks = [],
  title = 'Tech Stack',
  description = 'Master professional data tools.',
  className = '',
}) {
  const defaultFrameworks = [
    { name: 'Python', icon: '🐍', color: '#3776ab' },
    { name: 'Pandas', icon: '🐼', color: '#150458' },
    { name: 'NumPy', icon: '📊', color: '#013243' },
    { name: 'Matplotlib', icon: '📈', color: '#11557c' },
    { name: 'Pyodide', icon: '⚛️', color: '#f0db4f' },
    { name: 'Monaco', icon: '✏️', color: '#007acc' },
  ];

  const items = frameworks.length > 0 ? frameworks : defaultFrameworks;

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0a0e17]/80 to-[#060a13]/60 p-8 backdrop-blur-2xl ${className}`}>
      <div className="relative z-10">
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mb-8 text-sm text-white/50">{description}</p>

        <div className="flex flex-wrap gap-4">
          {items.map((fw, i) => (
            <motion.div
              key={fw.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="group relative flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(99,102,241,0.08)]"
            >
              <span
                className="text-xl transition-transform duration-300 group-hover:scale-110"
                style={{ filter: `drop-shadow(0 0 6px ${fw.color}40)` }}
              >
                {fw.icon}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">{fw.name}</h3>
                <div
                  className="h-[2px] w-8 rounded-full opacity-50 transition-all duration-300 group-hover:w-12 group-hover:opacity-100"
                  style={{ background: fw.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
