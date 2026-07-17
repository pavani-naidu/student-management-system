import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', departmentId: '', durationYears: 4 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, deptRes] = await Promise.all([
        apiClient.get('/courses'),
        apiClient.get('/departments')
      ]);
      setCourses(courseRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      code: '',
      departmentId: departments[0]?.id || '',
      durationYears: 4
    });
    setEditingCourse(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setForm({
      name: course.name,
      code: course.code || '',
      departmentId: course.department?.id || '',
      durationYears: course.durationYears || 4
    });
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        departmentId: Number(form.departmentId)
      };
      if (editingCourse) {
        await apiClient.put(`/courses/${editingCourse.id}`, payload);
        toast.success('Course updated');
      } else {
        await apiClient.post('/courses', payload);
        toast.success('Course created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/courses/${deleteTarget.id}`);
      toast.success('Course deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">Manage academic courses and degrees</p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={departments.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-ink/50 dark:text-paper/50">Loading courses...</div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-10 text-ink/50 dark:text-paper/50">No courses found.</div>
      )}

      {!loading && (
        <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-white/10 text-left">
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Course Name</th>
                  <th className="px-6 py-3 font-semibold">Department</th>
                  <th className="px-6 py-3 font-semibold">Duration (Years)</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.02] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {course.code || '—'}
                    </td>
                    <td className="px-6 py-4 font-medium">{course.name}</td>
                    <td className="px-6 py-4">{course.department?.name || '—'}</td>
                    <td className="px-6 py-4">{course.durationYears} Years</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-indigo-500 flex items-center gap-1 text-xs font-medium"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(course)}
                          className="p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-red-500 flex items-center gap-1 text-xs font-medium"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-paper dark:bg-slate-900 rounded-badge p-6 shadow-xl border border-ink/10 dark:border-white/10"
          >
            <h2 className="font-display text-xl font-semibold mb-4">
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Course Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Course Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. BTCS"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <select
                  required
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Duration (Years)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="7"
                  value={form.durationYears}
                  onChange={(e) => setForm({ ...form, durationYears: Number(e.target.value) })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-ink/15 dark:border-white/15 text-sm font-medium hover:bg-ink/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete course?"
        message={`This will permanently remove course "${deleteTarget?.name}" from the system.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
