import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
}

export function Loader({ 
  size = 'md', 
  variant = 'primary', 
  text, 
  className,
  ...props 
}: LoaderProps) {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  const variantClass = {
    primary: 'border-primary-200 border-t-primary-600',
    secondary: 'border-neutral-200 border-t-neutral-600',
    white: 'border-white/30 border-t-white',
  };
  
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div 
        className={cn(
          'animate-spin rounded-full',
          sizeClass[size],
          variantClass[variant]
        )}
      />
      {text && <span className={cn(
        'text-sm font-medium',
        variant === 'white' ? 'text-white' : 'text-neutral-600'
      )}>{text}</span>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
        <Loader size="lg" />
        <p className="mt-4 text-neutral-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center">
      <Loader size="md" text={text} />
    </div>
  );
}

export function ButtonLoader({ variant = 'white' }: { variant?: 'primary' | 'secondary' | 'white' }) {
  return <Loader size="sm" variant={variant} />;
}