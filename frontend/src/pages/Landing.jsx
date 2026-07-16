import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, ClipboardCheck, Wallet, BarChart3, ShieldCheck,
  ArrowRight, Quote,
} from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Student records', desc: 'Every enrollment, contact, and academic detail in one searchable record.' },
  { icon: ClipboardCheck, title: 'Attendance tracking', desc: 'Daily and monthly attendance with automatic percentage calculations.' },
  { icon: BarChart3, title: 'Grades & results', desc: 'Internal and external marks, GPA calculation, and rank lists.' },
  { icon: Wallet, title: 'Fee management', desc: 'Track payments, send reminders, and generate receipts instantly.' },
  { icon: GraduationCap, title: 'Timetables', desc: 'Department, teacher, and student schedules that stay in sync.' },
  { icon: ShieldCheck, title: 'Role-based access', desc: 'Admins, teachers, and students each see exactly what they need.' },
];

const STATS = [
  { value: '12,400+', label: 'Students managed' },
  { value: '340', label: 'Institutions onboard' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.8/5', label: 'Average rating' },
];

const TESTIMONIALS = [
  {
    quote: 'Enrollment week used to take our staff three days of spreadsheet chaos. Now it takes an afternoon.',
    name: 'Priya Nair', role: 'Registrar, Crestview College',
  },
  {
    quote: 'Parents finally see attendance and fee status without calling the office. That alone paid for itself.',
    name: 'Daniel Osei', role: 'Principal, Northfield Academy',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper dark:bg-slate-925 text-ink dark:text-paper">
      {/* Nav */}
      <header className="sticky top-0 z-30 glass border-b border-ink/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-badge bg-indigo-600 flex items-center justify-center font-display font-bold text-white text-sm">
              M
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Meridian</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-indigo-500 transition-colors">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-ink hover:bg-amber-400 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-5">
            Built for schools & colleges
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
            Every student record, in one place, always up to date.
          </h1>
          <p className="mt-5 text-lg text-ink/70 dark:text-paper/70 max-w-lg">
            Meridian brings enrollment, attendance, grades, and fees together —
            so registrars stop chasing spreadsheets and start answering questions in seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-ink/15 dark:border-white/15 font-medium hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-badge p-6 shadow-card border border-ink/5 dark:border-white/5"
        >
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl bg-ink/[0.03] dark:bg-white/5 p-4">
                <p className="font-display text-2xl font-semibold text-indigo-500 dark:text-indigo-400">{s.value}</p>
                <p className="text-xs text-ink/60 dark:text-paper/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">Everything the front office needs</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-badge p-5 border border-ink/10 dark:border-white/10 hover:shadow-card transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-ink/60 dark:text-paper/60 mt-1.5">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold">About Meridian</h2>
            <p className="mt-4 text-white/80">
              Meridian is built for registrars, deans, and IT teams who inherited
              a patchwork of spreadsheets and legacy tools. One login, one
              database, role-based views for admins, teachers, and students.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label + '-about'} className="rounded-xl bg-white/10 p-4">
                <p className="font-display text-2xl font-semibold">{s.value}</p>
                <p className="text-xs text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">What administrators say</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-badge p-6 border border-ink/10 dark:border-white/10">
              <Quote className="text-amber-500" size={22} />
              <p className="mt-3 text-ink/80 dark:text-paper/80 italic">{t.quote}</p>
              <p className="mt-4 font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-ink/50 dark:text-paper/50">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-center">Get in touch</h2>
        <p className="text-center text-ink/60 dark:text-paper/60 mt-2">
          Questions about onboarding your institution? Send us a note.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 grid sm:grid-cols-2 gap-4 rounded-badge p-6 border border-ink/10 dark:border-white/10"
        >
          <input placeholder="Your name" className="px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent" />
          <input placeholder="Email address" type="email" className="px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent" />
          <textarea
            placeholder="How can we help?"
            rows={4}
            className="sm:col-span-2 px-4 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
          />
          <button className="sm:col-span-2 px-5 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
            Send message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink/60 dark:text-paper/60">
          <span>© {new Date().getFullYear()} Meridian Student Management System</span>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-indigo-500">Login</Link>
            <Link to="/register" className="hover:text-indigo-500">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
