import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Pencil, Trash2, Calendar, User, Users, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Notices() {
  const { user } = useAuth();
  const isWritableUser = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  // State
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', targetAudience: 'ALL' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch notices
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/notices');
      setNotices(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Save notice
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishedDate: editingNotice ? editingNotice.publishedDate : new Date().toISOString().split('T')[0]
      };
      if (editingNotice) {
        await apiClient.put(`/notices/${editingNotice.id}`, payload);
        toast.success('Notice updated successfully');
      } else {
        await apiClient.post('/notices', payload);
        toast.success('Notice posted successfully');
      }
      setModalOpen(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  };

  // Delete notice
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/notices/${deleteTarget.id}`);
      toast.success('Notice removed');
      setDeleteTarget(null);
      fetchNotices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Megaphone className="text-indigo-600 dark:text-indigo-400" />
            Notice Board
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Stay updated with official announcements, notifications, and campus news.
          </p>
        </div>

        {isWritableUser && (
          <button
            onClick={() => {
              setEditingNotice(null);
              setForm({ title: '', content: '', targetAudience: 'ALL' });
              setModalOpen(true);
            }}
            className="btn btn-indigo flex items-center gap-2"
          >
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink/60 dark:text-paper/60">Fetching notices...</p>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-badge p-6 border border-ink/5 dark:border-white/5 shadow-card flex flex-col justify-between space-y-4 hover:border-indigo-500/20 dark:hover:border-indigo-400/20 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    notice.targetAudience === 'ALL'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : notice.targetAudience === 'TEACHERS'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    For: {notice.targetAudience}
                  </span>
                  
                  {isWritableUser && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingNotice(notice);
                          setForm({ title: notice.title, content: notice.content, targetAudience: notice.targetAudience });
                          setModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-indigo-500"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(notice)}
                        className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{notice.title}</h3>
                <p className="text-sm text-ink/75 dark:text-paper/75 whitespace-pre-line leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="pt-4 border-t border-ink/5 dark:border-white/5 flex items-center justify-between text-xs text-ink/50 dark:text-paper/50 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {notice.publishedDate}
                </span>
                <span className="flex items-center gap-1">
                  <User size={13} />
                  Posted by: {notice.postedBy || 'Staff'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-badge p-12 border border-white/5 text-center max-w-md mx-auto space-y-3">
          <Megaphone className="mx-auto text-ink/30 dark:text-paper/30 animate-pulse" size={48} />
          <h3 className="font-display text-lg font-semibold">Notice Board Empty</h3>
          <p className="text-sm text-ink/60 dark:text-paper/60">
            There are currently no announcements or notifications posted for your profile level.
          </p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-badge p-6 max-w-lg w-full border border-white/10 shadow-card"
          >
            <h3 className="font-display text-lg font-bold mb-4">
              {editingNotice ? 'Update Announcement' : 'Post New Notice'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. End Semester Exams Schedule"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Target Audience</label>
                <select
                  required
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  className="select w-full"
                >
                  <option value="ALL">Everyone (ALL)</option>
                  <option value="TEACHERS">Teachers Only</option>
                  <option value="STUDENTS">Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Content Details</label>
                <textarea
                  required
                  rows="6"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input w-full resize-none py-2"
                  placeholder="Write the details of the notice or announcement here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-indigo"
                >
                  {saving ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Remove Notice Announcement?"
          message={`Are you sure you want to delete this notice titled "${deleteTarget.title}"? This announcement will disappear from the board immediately.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
