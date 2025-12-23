import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'pulse' | 'dots' | 'orbit' | 'wave' | 'infinity';
  className?: string;
}

export function Spinner({ 
  size = 'md', 
  variant = 'orbit',
  className 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  if (variant === 'pulse') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-primary/40 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex gap-2 items-center justify-center', className)}>
        <div 
          className={cn(
            'rounded-full bg-primary',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
          )}
          style={{
            animation: 'bounce 1.4s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
        <div 
          className={cn(
            'rounded-full bg-primary',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
          )}
          style={{
            animation: 'bounce 1.4s ease-in-out infinite',
            animationDelay: '0.2s'
          }}
        />
        <div 
          className={cn(
            'rounded-full bg-primary',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
          )}
          style={{
            animation: 'bounce 1.4s ease-in-out infinite',
            animationDelay: '0.4s'
          }}
        />
      </div>
    );
  }

  if (variant === 'orbit') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        {/* Centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'rounded-full bg-primary',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'
          )} />
        </div>
        
        {/* Órbita 1 */}
        <div 
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '1.5s' }}
        >
          <div className={cn(
            'absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-primary',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>
        
        {/* Órbita 2 */}
        <div 
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        >
          <div className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-primary/60',
            size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={cn('flex gap-1 items-end', className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-primary rounded-sm',
              size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
              size === 'sm' ? 'h-6' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-14' : 'h-20'
            )}
            style={{
              animation: 'wave 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
              transformOrigin: 'bottom'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'infinity') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <svg
          className="animate-spin"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 25,50 A 15,15 0 1,1 25,49.9 M 75,50 A 15,15 0 1,0 75,49.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
      </div>
    );
  }

  return null;
}

// Componente de página de carga completa
export function LoadingScreen({ 
  message = 'Cargando...',
  variant = 'orbit' 
}: { 
  message?: string;
  variant?: SpinnerProps['variant'];
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <Spinner size="xl" variant={variant} />
      <p className="text-muted-foreground text-lg animate-pulse">{message}</p>
    </div>
  );
}

// Componente inline para botones
export function ButtonSpinner({ size = 'sm' }: { size?: SpinnerProps['size'] }) {
  return <Spinner size={size} variant="dots" className="inline-flex" />;
}
