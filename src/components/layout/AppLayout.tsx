import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { SquaresFour, ListChecks, Star, Crosshair, User, Globe, Check, CaretLeft, CaretRight } from '@phosphor-icons/react'
import ThemeToggle from '../ThemeToggle'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n'
import { useTranslation } from 'react-i18next'

const navItems = [
  { to: '/app/home',     label: 'Home',     Icon: SquaresFour },
  { to: '/app/today',    label: 'Today',    Icon: ListChecks  },
  { to: '/app/map',      label: 'Wishes',   Icon: Star        },
  { to: '/app/goals',    label: 'Goals',    Icon: Crosshair   },
  { to: '/app/settings', label: 'Settings', Icon: User        },
]

function LangPicker({ collapsed }: { collapsed?: boolean }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Language"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Globe size={16} />
        {!collapsed && <span className="hidden sm:inline">{current.flag} {current.nativeName}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 bottom-full mb-1 w-44 rounded-xl border border-black/5 dark:border-white/10 shadow-xl z-50 py-1 overflow-hidden"
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
                {i18n.language === lang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })

  const toggleSidebar = () => {
    setCollapsed(c => {
      const next = !c
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* ── Sidebar — desktop only ── */}
      <aside
        className={`hidden md:flex flex-col border-r border-black/5 dark:border-white/5 transition-all duration-200 flex-shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* Logo + toggle */}
        <div className={`flex items-center py-5 px-3 mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png" alt="StepToGoal" className="w-7 h-7 rounded-lg flex-shrink-0" />
              <span className="font-bold text-base bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                StepToGoal
              </span>
            </div>
          )}
          {collapsed && <img src="/logo.png" alt="StepToGoal" className="w-7 h-7 rounded-lg" />}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            style={{ color: 'var(--color-text-muted)' }}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''} ${
                  isActive ? 'bg-purple-600/15 text-purple-400' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: 'var(--color-text-secondary)' }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className={`py-4 px-2 border-t border-black/5 dark:border-white/5 flex ${collapsed ? 'flex-col items-center gap-2' : 'items-center justify-between'}`}>
          <LangPicker collapsed={collapsed} />
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 flex-shrink-0"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="StepToGoal" className="w-7 h-7 rounded-lg" />
            <span className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              StepToGoal
            </span>
          </div>
          <div className="flex items-center gap-1">
            <LangPicker />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-full">
          <Outlet />
        </main>

        {/* ── Bottom nav — mobile only ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 border-t border-black/5 dark:border-white/5 flex justify-around py-1 z-50"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0 ${
                  isActive ? 'text-purple-400' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="text-[10px] leading-tight">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
