import { useState, useEffect } from 'react';

/**
 * shadcn/ui — Toast
 * Elegant notification toasts with glassmorphism and smooth animation.
 */
export default function Toast({
  message,
  duration = 4000,
  type = 'info',
  onClose,
  open = true,
  className = '',
}) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  const colors = {
    info: 'border-[#6366f1]/30 shadow-[0_8px_30px_rgba(99,102,241,0.15)]',
    success: 'border-[#10b981]/30 shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
    warning: 'border-[#f59e0b]/30 shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
    error: 'border-[#ef4444]/30 shadow-[0_8px_30px_rgba(239,68,68,0.15)]',
  };

  const icons = {
    info: '💡',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  if (!visible && !open) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[300] max-w-sm rounded-2xl border bg-gradient-to-br from-[#0f131a]/95 to-[#060a13]/95 p-4 backdrop-blur-2xl transition-all duration-300 ${colors[type]} ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none">{icons[type]}</span>
        <p className="text-sm text-white/80 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
