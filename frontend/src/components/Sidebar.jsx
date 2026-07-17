import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Building2, ClipboardCheck,
  FileSpreadsheet, Wallet, Library, Home, Bus, ScrollText, CalendarDays,
  Clock, Settings, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/teachers', label: 'Teachers', icon: GraduationCap },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/marks', label: 'Marks', icon: FileSpreadsheet },
  { to: '/fees', label: 'Fees', icon: Wallet },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/hostel', label: 'Hostel', icon: Home },
  { to: '/transport', label: 'Transport', icon: Bus },
  { to: '/examinations', label: 'Examinations', icon: ScrollText },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/notices', label: 'Notices', icon: ScrollText },
  { to: '/events', label: 'Events', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const TEACHER_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/marks', label: 'Marks', icon: FileSpreadsheet },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/notices', label: 'Notices', icon: ScrollText },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/events', label: 'Events', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const STUDENT_LINKS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/my-attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/my-marks', label: 'Marks', icon: FileSpreadsheet },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/my-fees', label: 'Fees', icon: Wallet },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/hostel', label: 'Hostel', icon: Home },
  { to: '/transport', label: 'Transport', icon: Bus },
  { to: '/notices', label: 'Notices', icon: ScrollText },
  { to: '/events', label: 'Events', icon: Clock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const links = user?.role === 'ADMIN' ? ADMIN_LINKS : user?.role === 'TEACHER' ? TEACHER_LINKS : STUDENT_LINKS;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col
          bg-indigo-600 dark:bg-slate-850 text-white transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-badge bg-amber-500 flex items-center justify-center font-display font-bold text-ink text-sm">
              M
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Meridian</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-amber-500 text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
