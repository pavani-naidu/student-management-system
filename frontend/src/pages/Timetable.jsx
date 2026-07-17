import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function Timetable() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';

  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeDay, setActiveDay] = useState('MONDAY');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    courseId: '',
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    subject: '',
    teacherName: '',
    roomNumber: '',
  });

  // Fetch courses (only for Admin or Teacher)
  const fetchCourses = async () => {
    if (isStudent) return;
    try {
      const res = await apiClient.get('/courses');
      const data = res.data.data || [];
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id.toString());
      }
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  // Fetch timetable entries
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        // Fetch current student's timetable
        const res = await apiClient.get('/timetable/my');
        setTimetable(res.data.data || []);
      } else if (selectedCourseId) {
        // Fetch timetable for selected course
        const res = await apiClient.get(`/timetable?courseId=${selectedCourseId}`);
        setTimetable(res.data.data || []);
      } else {
        setTimetable([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [selectedCourseId, user]);

  const handleOpenAdd = () => {
    setForm({
      courseId: selectedCourseId,
      dayOfWeek: activeDay,
      startTime: '',
      endTime: '',
      subject: '',
      teacherName: '',
      roomNumber: '',
    });
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setForm({
      courseId: entry.courseId.toString(),
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subject: entry.subject,
      teacherName: entry.teacherName || '',
      roomNumber: entry.roomNumber || '',
    });
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error('Please select a course');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        courseId: parseInt(form.courseId),
      };

      if (editingEntry) {
        await apiClient.put(`/timetable/${editingEntry.id}`, payload);
        toast.success('Timetable entry updated');
      } else {
        await apiClient.post('/timetable', payload);
        toast.success('Timetable entry created');
      }
      setModalOpen(false);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save timetable entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/timetable/${deleteTarget.id}`);
      toast.success('Timetable entry deleted');
      setDeleteTarget(null);
      fetchTimetable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Filter timetable for active day
  const filteredEntries = timetable.filter(
    (entry) => entry.dayOfWeek.toUpperCase() === activeDay.toUpperCase()
  );

  // Sort by startTime
  const sortedEntries = [...filteredEntries].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Weekly Timetable</h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            {isStudent ? 'Your academic schedule' : 'Manage course timetables and slots'}
          </p>
        </div>

        {/* Course Selector for Admin / Teacher */}
        {!isStudent && courses.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {isAdmin && selectedCourseId && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition"
          >
            <Plus size={16} /> Add Slot
          </button>
        )}
      </div>

      {/* Weekdays Tabs */}
      <div className="flex border-b border-ink/10 dark:border-paper/10 overflow-x-auto pb-px">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeDay === day
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper'
            }`}
          >
            {day.charAt(0) + day.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Timetable Slots Display */}
      {loading ? (
        <div className="text-center py-12 text-ink/50 dark:text-paper/50">Loading schedule...</div>
      ) : sortedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-paper dark:bg-zinc-900 rounded-xl border border-ink/5 dark:border-paper/5 text-center">
          <Calendar size={48} className="text-ink/30 dark:text-paper/30 mb-3" />
          <h3 className="font-semibold text-lg">No classes scheduled</h3>
          <p className="text-sm text-ink/50 dark:text-paper/50 mt-1 max-w-sm">
            There are no classes scheduled for {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEntries.map((entry) => (
            <motion.div
              layout
              key={entry.id}
              className="p-5 bg-paper dark:bg-zinc-900 rounded-xl border border-ink/10 dark:border-paper/10 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    {entry.courseName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-ink/60 dark:text-paper/60 font-medium">
                    <Clock size={13} className="text-indigo-600" />
                    <span>
                      {entry.startTime} - {entry.endTime}
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-indigo-900 dark:text-indigo-400">
                  {entry.subject}
                </h3>

                <div className="grid grid-cols-1 gap-2 text-sm text-ink/75 dark:text-paper/75 pt-2">
                  <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-ink/40" />
                    <span>{entry.teacherName || 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-ink/40" />
                    <span>Room: {entry.roomNumber || 'TBA'}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-ink/5 dark:border-paper/5">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded hover:bg-ink/5 dark:hover:bg-paper/5 text-ink/70 dark:text-paper/70 transition"
                    title="Edit slot"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(entry)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition"
                    title="Delete slot"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-paper dark:bg-zinc-900 border border-ink/10 dark:border-paper/10 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold font-display mb-4">
              {editingEntry ? 'Edit Class Slot' : 'Add Timetable Slot'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                  Course
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                    Day
                  </label>
                  <select
                    required
                    value={form.dayOfWeek}
                    onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-ink/70 uppercase tracking-wider">
                  Room Number
                </label>
                <input
                  type="text"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                  placeholder="e.g. LH-201"
                  className="w-full px-3.5 py-2 rounded-lg border border-ink/10 dark:border-paper/10 bg-paper dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-ink/10 text-sm font-semibold hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Schedule Entry?"
          message={`Are you sure you want to delete the schedule entry for ${deleteTarget.subject}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
