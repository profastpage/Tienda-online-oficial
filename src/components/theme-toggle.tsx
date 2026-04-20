'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ThemeToggle({ className = '', size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  const buttonClass = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9'

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${buttonClass} rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors ${className}`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      <Sun className={`${iconSize} rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0`} />
      <Moon className={`absolute ${iconSize} rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100`} />
      {showLabel && (
        <span className="ml-2 text-xs font-medium hidden sm:inline">
          {theme === 'dark' ? 'Claro' : 'Oscuro'}
        </span>
      )}
    </Button>
  )
}
