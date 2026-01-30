import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-zinc-950/90 border border-white/15 rounded-xl p-8 ${className}`}>
      {children}
    </div>
  );
}
