import { useState, useEffect } from 'react';

/**
 * Eldora UI — Terminal
 * A beautifully styled terminal component with typing animation.
 */
export default function Terminal({
  commands = [],
  prompt = '>',
  title = 'terminal',
  className = '',
  autoType = false,
  typingDelay = 40,
}) {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    if (!autoType || commands.length === 0) return;

    const interval = setInterval(() => {
      if (currentLineIndex >= commands.length) {
        clearInterval(interval);
        return;
      }

      const line = commands[currentLineIndex];
      const isCommand = line.type === 'command';

      if (typedChars < line.text.length) {
        setTypedChars((prev) => prev + 1);
      } else {
        // Line finished - add it fully and move to next
        setDisplayedLines((prev) => [
          ...prev,
          { ...line, text: line.text },
        ]);
        setCurrentLineIndex((prev) => prev + 1);
        setTypedChars(0);
      }
    }, typingDelay);

    return () => clearInterval(interval);
  }, [autoType, commands, currentLineIndex, typedChars, typingDelay]);

  const currentLine = autoType && currentLineIndex < commands.length ? commands[currentLineIndex] : null;
  const partialText = currentLine ? currentLine.text.slice(0, typedChars) : '';

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d1117]/90 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] ${className}`}>
      {/* Terminal header */}
      <div className="flex items-center gap-3 border-b border-white/[0.05] bg-gradient-to-r from-[#161b22] to-[#0d1117] px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ef4444]/80" />
          <div className="h-3 w-3 rounded-full bg-[#f59e0b]/80" />
          <div className="h-3 w-3 rounded-full bg-[#10b981]/80" />
        </div>
        <span className="text-xs font-mono text-white/40">{title}</span>
      </div>

      {/* Terminal body */}
      <div className="p-4 font-mono text-sm leading-relaxed">
        {(autoType ? displayedLines : commands).map((line, i) => (
          <div key={i} className="mb-1 flex gap-3">
            <span className="shrink-0 text-[#818cf8]/60 select-none">{prompt}</span>
            <span className={`${line.type === 'output' ? 'text-emerald-400/80' : 'text-white/90'} ${line.type === 'command' ? 'font-medium' : ''}`}>
              {line.text}
            </span>
          </div>
        ))}

        {autoType && currentLine && (
          <div className="mb-1 flex gap-3 animate-pulse">
            <span className="shrink-0 text-[#818cf8]/60 select-none">{prompt}</span>
            <span className="text-white/90">
              {partialText}
              <span className="ml-0.5 inline-block h-4 w-0.5 bg-[#818cf8] animate-pulse align-middle" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
