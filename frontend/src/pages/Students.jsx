import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Download, FileText, Pencil, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import StudentFormModal from '../components/StudentFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const PAGE_SIZE = 10;

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [direction, setDirection] = useState('asc');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/students', {
        params: {
          query: query || undefined,
          departmentId: departmentFilter || undefined,
          status: statusFilter || undefined,
          page,
          size: PAGE_SIZE,
          sortBy,
          direction,
        },
      });
      const data = res.data.data;
      setStudents(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [query, departmentFilter, statusFilter, page, sortBy, direction]);

  const fetchLookups = useCallback(async () => {
    try {
      const [deptRes, courseRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/courses'),
      ]);
      setDepartments(deptRes.data.data);
      setCourses(courseRes.data.data);
    } catch {
      // Departments/courses are ADMIN-only endpoints — a TEACHER login will get a 403 here,
      // which is expected; the student table itself still works without these lookups.
    }
  }, []);

  useEffect(() => { fetchLookups(); }, [fetchLookups]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setDirection('asc');
    }
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingStudent) {
        await apiClient.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student updated');
      } else {
        await apiClient.post('/students', formData);
        toast.success('Student added');
      }
      setModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/students/${deleteTarget.id}`);
      toast.success('Student deleted');
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const exportCsv = () => {
    const headers = ['Roll Number', 'Name', 'Email', 'Department', 'Course', 'Status'];
    const rows = students.map((s) => [
      s.rollNumber, `${s.firstName} ${s.lastName}`, s.email, s.departmentName ?? '', s.courseName ?? '', s.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = {
    ACTIVE: 'bg-green-500/10 text-green-600 dark:text-green-400',
    INACTIVE: 'bg-gray-500/10 text-gray-500',
    GRADUATED: 'bg-indigo-500/10 text-indigo-500',
    SUSPENDED: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Students</h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">{totalElements} students on record</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ink/15 dark:border-white/15 text-sm font-medium hover:bg-ink/5 dark:hover:bg-white/5"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-ink/15 dark:border-white/15 text-sm font-medium hover:bg-ink/5 dark:hover:bg-white/5"
          >
            <FileText size={16} /> Print
          </button>
          <button
            onClick={() => { setEditingStudent(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      <div className="glass rounded-badge p-4 shadow-card border border-ink/5 dark:border-white/5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40" />
          <input
            value={query}
            onChange={(e) => { setPage(0); setQuery(e.target.value); }}
            placeholder="Search by name, roll number, email..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => { setPage(0); setDepartmentFilter(e.target.value); }}
          className="px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm"
        >
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }}
          className="px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="GRADUATED">Graduated</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left">
                <Th label="Roll No." field="rollNumber" sortBy={sortBy} direction={direction} onSort={handleSort} />
                <Th label="Name" field="firstName" sortBy={sortBy} direction={direction} onSort={handleSort} />
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-ink/50 dark:text-paper/50">Loading...</td></tr>
              )}
              {!loading && students.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-ink/50 dark:text-paper/50">No students found.</td></tr>
              )}
              {!loading && students.map((s) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.02] dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 font-medium">{s.rollNumber}</td>
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-paper/70">{s.email}</td>
                  <td className="px-4 py-3">{s.departmentName ?? '—'}</td>
                  <td className="px-4 py-3">{s.courseName ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingStudent(s); setModalOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-ink/10 dark:hover:bg-white/10 text-indigo-500"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 rounded-lg hover:bg-ink/10 dark:hover:bg-white/10 text-red-500"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-ink/10 dark:border-white/10">
          <span className="text-xs text-ink/50 dark:text-paper/50">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-ink/15 dark:border-white/15 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-ink/15 dark:border-white/15 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <StudentFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingStudent(null); }}
        onSave={handleSave}
        student={editingStudent}
        departments={departments}
        courses={courses}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete student?"
        message={`This will permanently remove ${deleteTarget?.firstName} ${deleteTarget?.lastName} from the system.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Th({ label, field, sortBy, direction, onSort }) {
  const active = sortBy === field;
  return (
    <th className="px-4 py-3 font-semibold">
      <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-indigo-500">
        {label}
        <ArrowUpDown size={12} className={active ? 'text-amber-500' : 'text-ink/30 dark:text-paper/30'} />
      </button>
    </th>
  );
}
