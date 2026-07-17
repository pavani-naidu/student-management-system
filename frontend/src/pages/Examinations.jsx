import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, CalendarDays, BookOpen, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Examinations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    courseId: '',
    maxMarks: '',
    passingMarks: ''
  });

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/exams');
      setExams(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load examinations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await apiClient.get('/courses');
      setCourses(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load courses');
    }
  }, []);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, [fetchExams, fetchCourses]);

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      courseId: courses.length > 0 ? courses[0].id.toString() : '',
      maxMarks: 100,
      passingMarks: 40
    });
    setModalOpen(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name,
      date: exam.date || '',
      courseId: exam.courseId?.toString() || '',
      maxMarks: exam.maxMarks,
      passingMarks: exam.passingMarks
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.courseId || !formData.maxMarks || !formData.passingMarks) {
      toast.error('Please fill in all required fields');
      return;
    }

    const max = Number(formData.maxMarks);
    const passing = Number(formData.passingMarks);

    if (max <= 0) {
      toast.error('Maximum marks must be greater than 0');
      return;
    }

    if (passing < 0 || passing > max) {
      toast.error('Passing marks must be between 0 and maximum marks');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        date: formData.date || null,
        courseId: Number(formData.courseId),
        maxMarks: max,
        passingMarks: passing
      };

      if (editingExam) {
        await apiClient.put(`/exams/${editingExam.id}`, payload);
        toast.success('Examination updated');
      } else {
        await apiClient.post('/exams', payload);
        toast.success('Examination created');
      }
      setModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/exams/${deleteTarget.id}`);
      toast.success('Examination deleted');
      setDeleteTarget(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            Examination Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Create exams, schedule dates, and enter results for student cohorts.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Exam
          </button>
        )}
      </div>

      {/* Exams Grid/List */}
      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.02] dark:bg-white/[0.02]">
                <th className="px-5 py-3.5 font-semibold">Exam Name</th>
                <th className="px-5 py-3.5 font-semibold">Course</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold text-center">Max Marks</th>
                <th className="px-5 py-3.5 font-semibold text-center">Passing Marks</th>
                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Loading examinations...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && exams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <AlertCircle size={28} className="text-indigo-500" />
                      <p className="font-medium text-sm">No examinations scheduled yet.</p>
                      {isAdmin && <p className="text-xs text-ink/40 dark:text-paper/40">Click "Create Exam" to schedule your first exam.</p>}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && exams.map((exam) => (
                <motion.tr
                  key={exam.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01] transition-colors align-middle"
                >
                  <td className="px-5 py-4 font-semibold text-ink/90 dark:text-paper/90">{exam.name}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <BookOpen size={12} /> {exam.courseName}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-ink/70 dark:text-paper/70 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-ink/45 dark:text-paper/45" /> {formatDate(exam.date)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-ink/80 dark:text-paper/80">{exam.maxMarks}</td>
                  <td className="px-5 py-4 text-center font-semibold text-amber-600 dark:text-amber-400">{exam.passingMarks}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/marks?examId=${exam.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-ink text-xs font-bold hover:bg-amber-600 shadow-sm"
                        title="Enter Marks"
                      >
                        <FileSpreadsheet size={14} /> Enter Marks
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEditModal(exam)}
                            className="p-1.5 rounded-lg border border-ink/10 dark:border-white/10 hover:bg-ink/5 dark:hover:bg-white/5 text-indigo-600 dark:text-indigo-400"
                            title="Edit Exam"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exam)}
                            className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/5 text-red-500"
                            title="Delete Exam"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create/Edit Exam */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass rounded-badge shadow-card border border-ink/10 dark:border-white/10 overflow-hidden bg-paper dark:bg-slate-900">
            <div className="flex justify-between items-center px-6 py-4 border-b border-ink/10 dark:border-white/10">
              <h2 className="font-display text-lg font-bold">
                {editingExam ? 'Edit Examination' : 'Create Examination'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-ink/65 dark:text-paper/65 hover:text-ink dark:hover:text-paper"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink/75 dark:text-paper/75">Exam Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Midterm Physics, Final Mathematics"
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink/75 dark:text-paper/75">Course *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink/75 dark:text-paper/75">Exam Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink/75 dark:text-paper/75">Max Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink/75 dark:text-paper/75">Passing Marks *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-ink/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Examination?"
        message={`This will permanently remove the exam "${deleteTarget?.name}" and all associated marks.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
