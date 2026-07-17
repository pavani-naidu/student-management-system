import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Pencil, Trash2, MapPin, User, Tag, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Events() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', location: '', organizer: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/events');
      setEvents(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Save event
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent) {
        await apiClient.put(`/events/${editingEvent.id}`, form);
        toast.success('Event updated successfully');
      } else {
        await apiClient.post('/events', form);
        toast.success('Event scheduled successfully');
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  // Delete event
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/events/${deleteTarget.id}`);
      toast.success('Event deleted');
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="text-indigo-600 dark:text-indigo-400" />
            Campus Events
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Browse upcoming academic lectures, cultural programs, sports activities, and holidays.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingEvent(null);
              setForm({ title: '', description: '', eventDate: new Date().toISOString().split('T')[0], location: '', organizer: '' });
              setModalOpen(true);
            }}
            className="btn btn-indigo flex items-center gap-2"
          >
            <Plus size={16} /> Schedule Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-ink/60 dark:text-paper/60">Fetching events calendar...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-badge p-5 border border-ink/5 dark:border-white/5 shadow-card flex flex-col justify-between space-y-4 hover:border-indigo-500/20 dark:hover:border-indigo-400/20 transition-all duration-300 relative group"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <CalendarDays size={14} />
                    {event.eventDate}
                  </div>
                  
                  {isAdmin && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-300">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setForm({ title: event.title, description: event.description, eventDate: event.eventDate, location: event.location, organizer: event.organizer });
                          setModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-indigo-500"
                        title="Edit Event"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(event)}
                        className="p-1 rounded hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                        title="Delete Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{event.title}</h3>
                <p className="text-xs text-ink/70 dark:text-paper/70 line-clamp-3 leading-relaxed">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-ink/5 dark:border-white/5 text-xs text-ink/60 dark:text-paper/60 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-amber-500" />
                  <span>{event.location || 'Campus Grounds'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-indigo-500" />
                  <span>By: {event.organizer || 'Administration'}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-badge p-12 border border-white/5 text-center max-w-md mx-auto space-y-3">
          <CalendarDays className="mx-auto text-ink/30 dark:text-paper/30" size={48} />
          <h3 className="font-display text-lg font-semibold">No Events Scheduled</h3>
          <p className="text-sm text-ink/60 dark:text-paper/60">
            There are currently no campus activities, holidays, or lectures scheduled.
          </p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-badge p-6 max-w-md w-full border border-white/10 shadow-card"
          >
            <h3 className="font-display text-lg font-bold mb-4">
              {editingEvent ? 'Edit Event Schedule' : 'Schedule New Event'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Annual Sports Meet"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Event Date</label>
                <input
                  type="date"
                  required
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Seminar Hall A"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Organizer / Host</label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Student Council"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-ink/50 dark:text-paper/50 mb-1">Brief Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input w-full resize-none py-2"
                  placeholder="Describe what the event is about..."
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
                  {saving ? 'Scheduling...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Cancel Scheduled Event?"
          message={`Are you sure you want to cancel the event titled "${deleteTarget.title}"? It will be removed from the calendar immediately.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
