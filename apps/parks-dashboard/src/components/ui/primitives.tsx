import { type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <div
    className={cn(
      'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
      className,
    )}
  >
    {children}
  </div>
);

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
};

const buttonVariants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'border border-slate-300 bg-white hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-parks-red text-white hover:bg-red-700',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled,
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50',
      buttonVariants[variant],
      className,
    )}
  >
    {children}
  </button>
);

type BadgeProps = {
  children: ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
};

const badgeColors = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-800',
};

export const Badge = ({ children, color = 'gray' }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
      badgeColors[color],
    )}
  >
    {children}
  </span>
);
