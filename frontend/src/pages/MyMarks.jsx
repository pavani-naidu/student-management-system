import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Check, X, Calendar, AlertCircle, Award, Target, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';

export default function MyMarks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyMarks = async () => {
      try {
        const res = await apiClient.get('/marks/my');
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load marks and academic stats');
      } finally {
        setLoading(false);
      }
    };
    fetchMyMarks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-ink/60 dark:text-paper/60">Loading academic profile...</p>
      </div>
    );
  }

  const stats = data?.stats || { averagePercentage: 0.0, gpa: 0.0, examsCleared: 0, totalExams: 0, highestMark: 0.0 };
  const history = data?.history || [];

  // Circle SVG metrics for the performance ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const percentage = stats.averagePercentage || 0;
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
          <FileSpreadsheet className="text-indigo-600 dark:text-indigo-400" /> My Academic Performance
        </h1>
        <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
          Monitor your examination marks, GPA standing, and passing logs.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* GPA & Percentage Circle Ring */}
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
                className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-700 ease-out"
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-paper/50">
              Average Score
            </span>
            <h2 className="text-xl font-bold mt-0.5 text-indigo-600 dark:text-indigo-400">
              GPA: {stats.gpa.toFixed(2)}
            </h2>
            <p className="text-[11px] text-ink/50 dark:text-paper/50">
              Scale 4.0 (Pass threshold 40%)
            </p>
          </div>
        </div>

        {/* Exams Cleared Card */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Exams Cleared
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">
              {stats.examsCleared} / {stats.totalExams}
            </h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Passed assessments</p>
          </div>
        </div>

        {/* Highest Mark Obtained */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Highest Score
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">
              {stats.highestMark.toFixed(1)}
            </h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Max obtained marks</p>
          </div>
        </div>

        {/* Total Examinations Card */}
        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Target size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
              Total Assessments
            </span>
            <h2 className="text-2xl font-bold mt-1 text-ink dark:text-paper">{stats.totalExams}</h2>
            <p className="text-xs text-ink/60 dark:text-paper/60">Evaluated exams</p>
          </div>
        </div>
      </div>

      {/* detailed marks history table */}
      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-ink/10 dark:border-white/10 bg-ink/[0.01] dark:bg-white/[0.01]">
          <h2 className="text-sm font-semibold">Detailed Exam Report Sheet</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.02] dark:bg-white/[0.02]">
                <th className="px-5 py-3 font-semibold">Exam Details</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold text-center">Passing Target</th>
                <th className="px-5 py-3 font-semibold text-center">Score Obtained</th>
                <th className="px-5 py-3 font-semibold text-center">Status</th>
                <th className="px-5 py-3 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <AlertCircle size={28} className="text-indigo-500" />
                      <p className="font-medium text-sm">No exam scores available yet.</p>
                      <p className="text-xs text-ink/40 dark:text-paper/40">Your scores will display once teachers record grades for your exams.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((m, i) => (
                  <motion.tr
                    key={m.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink/90 dark:text-paper/90">{m.examName}</div>
                      <div className="text-[10px] text-ink/45 dark:text-paper/45 uppercase tracking-wider font-bold">Course Exam</div>
                    </td>
                    <td className="px-5 py-4 text-ink/70 dark:text-paper/70 font-medium whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-ink/45 dark:text-paper/45" /> {formatDate(m.examDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-ink/50 dark:text-paper/50">
                      {m.examPassingMarks} / {m.examMaxMarks}
                    </td>
                    <td className="px-5 py-4 text-center font-extrabold text-ink/90 dark:text-paper/90">
                      {m.obtainedMarks} / {m.examMaxMarks}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold whitespace-nowrap ${
                          m.passed
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {m.passed ? <Check size={12} /> : <X size={12} />}
                        {m.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink/65 dark:text-paper/65 font-medium italic">
                      {m.remarks || '—'}
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
