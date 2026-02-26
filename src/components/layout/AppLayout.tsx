import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { SquaresFour, ListChecks, Star, Crosshair, User, Globe, Check } from '@phosphor-icons/react'
import ThemeToggle from '../ThemeToggle'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n'
import { useTranslation } from 'react-i18next'

const navItems = [
  { to: '/app/home',     label: 'Home',    Icon: SquaresFour },
  { to: '/app/today',    label: 'Today',   Icon: ListChecks  },
  { to: '/app/map',      label: 'Wishes',  Icon: Star        },
  { to: '/app/goals',    label: 'Goals',   Icon: Crosshair   },
  { to: '/app/settings', label: 'Profile', Icon: User        },
]

function LangPicker() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Globe size={16} />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-black/5 dark:border-white/10 shadow-xl z-50 py-1 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { changeLanguage(lang.code as any); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-purple-500/10 ${
                  i18n.language === lang.code ? 'text-purple-400' : ''
                }`}
                style={i18n.language !== lang.code ? { color: 'var(--color-text)' } : {}}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.nativeName}</span>
                {i18n.language === lang.code && <Check size={14} className="text-purple-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/5 py-6 px-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-3 mb-8 px-2">
          <img src="/logo.png" alt="StepToGoal" className="w-8 h-8 rounded-xl" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            StepToGoal
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar bottom — theme + lang */}
        <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-1 px-2">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Appearance</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Language</span>
            <LangPicker />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header — mobile + desktop */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 flex-shrink-0"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {/* Logo — mobile only */}
          <div className="flex items-center gap-2 md:hidden">
            <img src="/logo.png" alt="StepToGoal" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-base bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              StepToGoal
            </span>
          </div>

          {/* Desktop: spacer */}
          <div className="hidden md:block" />

          {/* Right controls — always visible */}
          <div className="flex items-center gap-1">
            <LangPicker />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom nav — mobile */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 border-t border-black/5 dark:border-white/5 flex justify-around py-2 z-50"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-purple-400' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="text-[10px]">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
