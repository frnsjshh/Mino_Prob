import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
