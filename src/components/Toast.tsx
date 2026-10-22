import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80',
    info: 'border-cyan-500/30 bg-cyan-950/80',
    error: 'border-rose-500/30 bg-rose-950/80',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl text-slate-100 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borders[toast.type]}`}
      role="status"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-100">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
