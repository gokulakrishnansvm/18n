import React, { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeTransitionProps {
  children: React.ReactNode;
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
    let timeoutId: NodeJS.Timeout;

    if (show) {
      setShouldRender(true);
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
      <div
          className={cn(
              'transition-all transform',
              isVisible ?
                  'opacity-100 translate-y-0' :
                  'opacity-0 translate-y-4',
              className
          )}
          style={{
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
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