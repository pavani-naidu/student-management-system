import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/departments');
      setDepartments(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setForm({ name: '', code: '', description: '' });
    setEditingDept(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setEditingDept(dept);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDept) {
        await apiClient.put(`/departments/${editingDept.id}`, form);
        toast.success('Department updated');
      } else {
        await apiClient.post('/departments', form);
        toast.success('Department created');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/departments/${deleteTarget.id}`);
      toast.success('Department deleted');
      setDeleteTarget(null);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Departments</h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">Manage academic departments</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-ink/50 dark:text-paper/50">Loading departments...</div>
      )}

      {!loading && departments.length === 0 && (
        <div className="text-center py-10 text-ink/50 dark:text-paper/50">No departments found.</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-badge p-6 shadow-card border border-ink/5 dark:border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    {dept.code || 'DEPT'}
                  </div>
                  <h3 className="font-display font-semibold text-lg">{dept.name}</h3>
                </div>
                <p className="text-sm text-ink/70 dark:text-paper/70 mt-3 line-clamp-3">
                  {dept.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-ink/5 dark:border-white/5">
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-indigo-500 flex items-center gap-1 text-xs font-medium"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(dept)}
                  className="p-1.5 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 text-red-500 flex items-center gap-1 text-xs font-medium"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
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
              {editingDept ? 'Edit Department' : 'Add Department'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Department Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Department Code</label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. CSE"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                  placeholder="Describe the department..."
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
        title="Delete department?"
        message={`This will permanently remove department "${deleteTarget?.name}" and all associated courses.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
