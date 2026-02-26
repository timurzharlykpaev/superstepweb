import { Sun, Moon } from '@phosphor-icons/react'
import { useThemeStore } from '../store/themeStore'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-gray-400 hover:text-white dark:hover:text-white light:hover:text-gray-700 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 transition-colors ${className}`}
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      {theme === 'dark' ? <Sun size={20} weight="fill" /> : <Moon size={20} weight="fill" />}
    </button>
  )
}
