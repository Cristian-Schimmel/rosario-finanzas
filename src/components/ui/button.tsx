'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-dark active:bg-accent-dark/90 dark:bg-cyan-600 dark:hover:bg-cyan-500',
      secondary: 'bg-surface border border-border text-text-primary hover:bg-interactive-hover dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700',
      ghost: 'bg-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      danger: 'bg-negative text-white hover:bg-negative-dark dark:bg-rose-600 dark:hover:bg-rose-500',
      outline: 'bg-transparent border border-accent text-accent hover:bg-accent-light dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-950/50',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
