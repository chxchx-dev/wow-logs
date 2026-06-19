import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section className={clsx('rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20', className)}>
      {children}
    </section>
  );
}
