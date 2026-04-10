import React from 'react'
import cn from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost'
}

export const Button: React.FC<ButtonProps> = ({ className, variant = 'default', ...props }) => {
  const base = 'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium'
  const variants: Record<string, string> = {
    default: 'bg-sky-600 text-white hover:bg-sky-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
  }

  return <button className={cn(base, variants[variant], className)} {...props} />
}
