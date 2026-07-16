import { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Fee payment due for 12 students', time: '2h ago' },
    { id: 2, text: 'New notice: Semester exam schedule posted', time: '5h ago' },
    { id: 3, text: 'Assignment submissions closing tomorrow', time: '1d ago' },
  ];

  return (
    <header className="sticky top-0 z-20 glass px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="lg:hidden text-ink dark:text-paper">
          <Menu size={22} />
        </button>
        <div className="relative hidden sm:block max-w-xs w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40" />
          <input
            type="text"
            placeholder="Search students, teachers, courses..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/80 dark:bg-slate-850/80 border border-ink/10 dark:border-white/10
              text-sm placeholder:text-ink/40 dark:placeholder:text-paper/40 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl glass shadow-card p-2 border border-ink/10 dark:border-white/10">
              <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">
                Notifications
              </p>
              {notifications.map((n) => (
                <div key={n.id} className="px-2 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/10 text-sm">
                  <p>{n.text}</p>
                  <p className="text-xs text-ink/40 dark:text-paper/40 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-ink/5 dark:hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden sm:block text-sm font-medium">{user?.fullName}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass shadow-card p-2 border border-ink/10 dark:border-white/10">
              <p className="px-3 py-2 text-xs text-ink/50 dark:text-paper/50 truncate">{user?.email}</p>
              <p className="px-3 pb-2 text-xs font-semibold text-amber-600">{user?.role}</p>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/10 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
