'use client';

import * as React from 'react';

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={["relative z-50 w-[90vw] max-w-lg rounded-lg border bg-white p-6 shadow-xl", className].join(' ')}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={["text-xl font-semibold", className].join(' ')}>{children}</h2>;
}
