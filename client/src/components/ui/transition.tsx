import React, { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeTransitionProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export function FadeTransition({
  children,
  show,
  duration = 300,
  className
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to ensure DOM update before animation starts
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  // Don't render if not needed
  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        'transition-opacity duration-300 ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

export function SlideUpTransition({
  children,
  show,
  duration = 300,
  className
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay to ensure DOM update before animation starts
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  // Don't render if not needed
  if (!shouldRender) return null;

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-in-out',
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}