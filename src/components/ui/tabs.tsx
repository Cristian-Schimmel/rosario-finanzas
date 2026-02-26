'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 p-1 rounded-lg bg-bg-secondary dark:bg-slate-900/80',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    count?: number;
  }
>(({ className, children, count, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2',
      'px-3 py-2 rounded-md text-sm font-medium',
      'text-text-muted dark:text-slate-400 transition-all duration-150',
      'hover:text-text-secondary hover:bg-bg-tertiary dark:hover:bg-slate-800 dark:hover:text-slate-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-cyan-500',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-surface-elevated data-[state=active]:text-text-primary',
      'data-[state=active]:shadow-soft',
      'dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white dark:data-[state=active]:shadow-none',
      className
    )}
    {...props}
  >
    {children}
    {count !== undefined && (
      <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-bg-muted text-text-muted dark:bg-slate-700 dark:text-slate-300">
        {count}
      </span>
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none',
      'data-[state=inactive]:hidden',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
