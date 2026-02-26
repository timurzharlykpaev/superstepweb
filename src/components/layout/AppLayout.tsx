import { Outlet, NavLink } from 'react-router-dom'
import { SquaresFour, ListChecks, Star, Crosshair, User } from '@phosphor-icons/react'

const navItems = [
  { to: '/app/today', label: 'Home',     Icon: SquaresFour },
  { to: '/app/chat',  label: 'Tasks',    Icon: ListChecks  },
  { to: '/app/map',   label: 'Wishes',   Icon: Star        },
  { to: '/app/goals', label: 'Goals',    Icon: Crosshair   },
  { to: '/app/settings', label: 'Profile', Icon: User      },
]

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0D0D0D] text-white overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1a1a1a] border-r border-white/5 py-6 px-4">
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
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom nav - mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/5 flex justify-around py-2 z-50">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-purple-400' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                  <span className="text-xs">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
