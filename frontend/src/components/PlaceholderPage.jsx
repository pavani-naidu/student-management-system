import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-badge p-10 shadow-card border border-ink/5 dark:border-white/5 flex flex-col items-center justify-center text-center gap-3 min-h-[50vh]"
    >
      <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
        <Construction size={26} />
      </div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-ink/60 dark:text-paper/60 max-w-md">
        This module's UI shell is wired into navigation and routing, but the backend
        endpoints and page logic haven't been built yet. It follows the same
        pattern as the Student Management module once you're ready to build it out.
      </p>
    </motion.div>
  );
}
