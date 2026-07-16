import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, accent = 'indigo', delay = 0 }) {
  const accentClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-paper/50">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentClasses[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
