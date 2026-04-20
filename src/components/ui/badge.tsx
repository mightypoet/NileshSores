import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'accent' | 'success' | 'destructive';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-white',
    outline: 'border border-zinc-200 text-zinc-700',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-zinc-900',
    success: 'bg-green-500 text-white',
    destructive: 'bg-red-500 text-white',
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-widest",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
