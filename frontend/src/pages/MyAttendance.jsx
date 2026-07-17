import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check, X, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';

export default function MyAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyAttendance = async () => {
      try {
        const res = await apiClient.get('/attendance/my');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };
    fetchMyAttendance();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-ink/60 dark:text-paper/60">Loading attendance profile...</p>
      </div>
    );
  }

  const stats = data?.stats || { presentCount: 0, absentCount: 0, totalCount: 0, attendancePercentage: 100.0 };
  const history = data?.history || [];

  // Circle SVG metrics for the attendance ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const percentage = stats.attendancePercentage;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Formatting date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <ClipboardCheck className="text-indigo-600 dark:text-indigo-400" /> My Attendance
        </h1>
        <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
          Review your overall attendance stats and daily presence log.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Percentage Ring */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-5">
          <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-ink/10 dark:stroke-white/10"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-amber-500 transition-all duration-700 ease-out"
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute font-display text-base font-bold text-ink dark:text-paper">
              {percentage}%
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Attendance
            </span>
            <h2 className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">
              {percentage >= 75 ? 'Good Standing' : 'Below Target'}
            </h2>
            <p className="text-xs text-ink/60 dark:text-paper/60 mt-0.5">
              Target requirement: 75%
            </p>
          </div>
        </div>

        {/* Present Days Card */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
            <Check size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Present Days
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">{stats.presentCount}</h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Classes attended</p>
          </div>
        </div>

        {/* Absent Days Card */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
            <X size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Absent Days
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">{stats.absentCount}</h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Classes missed</p>
          </div>
        </div>

        {/* Total Classes Card */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Total Classes
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">{stats.totalCount}</h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Total tracked sessions</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-ink/10 dark:border-white/10 bg-ink/[0.01] dark:bg-white/[0.01]">
          <h2 className="text-sm font-semibold">Detailed Logs & History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.02] dark:bg-white/[0.02]">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold w-40 text-center">Status</th>
                <th className="px-5 py-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <AlertCircle size={28} className="text-indigo-500" />
                      <p className="font-medium text-sm">No attendance records found yet.</p>
                      <p className="text-xs text-ink/40 dark:text-paper/40">Attendance data will populate once your teachers record them.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <motion.tr
                    key={h.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">{formatDate(h.date)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          h.status === 'PRESENT'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink/70 dark:text-paper/70 font-medium">
                      {h.remarks || '—'}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
