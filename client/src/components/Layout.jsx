import { Link, NavLink } from 'react-router-dom'
import { useTheme } from './ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/applications', label: 'Applications' },
  { to: '/board', label: 'Board' },
  { to: '/import', label: 'Import' },
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout({ children }) {
  const { theme, toggleTheme, themeLabels, themeIcons, resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">JobTracker</span>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
              AI
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={toggleTheme}
              className="ml-2 sm:ml-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              title={`Theme: ${themeLabels[theme]} (click to cycle)`}
              aria-label={`Current theme: ${themeLabels[theme]}. Click to cycle.`}
            >
              {themeIcons[theme]}
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}