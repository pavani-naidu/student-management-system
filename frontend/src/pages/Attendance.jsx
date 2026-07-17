import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Check, X, Save, ShieldAlert, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';

export default function Attendance() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // studentId -> { status: 'PRESENT' | 'ABSENT', remarks: '', id: null }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch departments & courses
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          apiClient.get('/departments'),
          apiClient.get('/courses')
        ]);
        const deptData = deptRes.data.data || [];
        const courseData = courseRes.data.data || [];
        setDepartments(deptData);
        setCourses(courseData);

        if (deptData.length > 0) {
          setSelectedDept(deptData[0].id.toString());
        }
      } catch (err) {
        toast.error('Failed to load departments and courses filters');
      }
    };
    fetchMetadata();
  }, []);

  // Filter courses depending on the selected department
  const filteredCourses = courses.filter(
    (c) => c.department?.id === Number(selectedDept)
  );

  // Auto-select first course when department changes
  useEffect(() => {
    if (filteredCourses.length > 0) {
      setSelectedCourse(filteredCourses[0].id.toString());
    } else {
      setSelectedCourse('');
    }
  }, [selectedDept, courses]);

  // Fetch students and their attendance records for the selected filters
  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedDept || !selectedCourse || !selectedDate) return;
    setLoading(true);
    try {
      // 1. Fetch all active students in the selected department & course
      const studentsRes = await apiClient.get('/students', {
        params: {
          departmentId: selectedDept,
          courseId: selectedCourse,
          status: 'ACTIVE',
          page: 0,
          size: 1000,
        }
      });
      const studentList = studentsRes.data.data.content || [];
      setStudents(studentList);

      // 2. Fetch existing attendance records for the selected date, dept, course
      const attRes = await apiClient.get('/attendance', {
        params: {
          departmentId: selectedDept,
          courseId: selectedCourse,
          date: selectedDate,
        }
      });
      const existingRecords = attRes.data.data || [];

      // 3. Map existing records by student ID
      const recordsMap = {};
      existingRecords.forEach(rec => {
        recordsMap[rec.studentId] = {
          status: rec.status,
          remarks: rec.remarks || '',
          id: rec.id
        };
      });

      // 4. Build initial state for all students (defaulting to PRESENT if no record exists)
      const initialMap = {};
      studentList.forEach(st => {
        if (recordsMap[st.id]) {
          initialMap[st.id] = recordsMap[st.id];
        } else {
          initialMap[st.id] = {
            status: 'PRESENT',
            remarks: '',
            id: null
          };
        }
      });

      setAttendanceMap(initialMap);
    } catch (err) {
      toast.error('Failed to load attendance sheet');
    } finally {
      setLoading(false);
    }
  }, [selectedDept, selectedCourse, selectedDate]);

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedDept, selectedCourse, selectedDate, loadAttendanceSheet]);

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus
      }
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: remarks
      }
    }));
  };

  const handleMarkAll = (status) => {
    if (students.length === 0) return;
    setAttendanceMap(prev => {
      const updated = { ...prev };
      students.forEach(st => {
        updated[st.id] = {
          ...updated[st.id],
          status
        };
      });
      return updated;
    });
    toast.success(`Marked all active students as ${status.toLowerCase()}`);
  };

  const handleSave = async () => {
    if (students.length === 0) {
      toast.error('No students to save attendance for');
      return;
    }
    setSaving(true);
    try {
      const records = students.map(st => ({
        studentId: st.id,
        status: attendanceMap[st.id]?.status || 'PRESENT',
        remarks: attendanceMap[st.id]?.remarks || ''
      }));

      const payload = {
        date: selectedDate,
        records
      };

      await apiClient.post('/attendance/bulk', payload);
      toast.success('Attendance sheet saved successfully');
      loadAttendanceSheet(); // Refresh from backend
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="text-indigo-600 dark:text-indigo-400" /> Attendance Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Track daily presence/absence records for academic cohorts.
          </p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/70 dark:text-paper/70">Department</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="" disabled>Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/70 dark:text-paper/70">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={filteredCourses.length === 0}
            className="w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
          >
            <option value="" disabled>
              {filteredCourses.length === 0 ? 'No courses in department' : 'Select Course'}
            </option>
            {filteredCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/70 dark:text-paper/70">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Attendance Actions and Table */}
      {selectedDept && selectedCourse && (
        <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
          {/* List controls */}
          <div className="p-4 border-b border-ink/10 dark:border-white/10 flex flex-wrap justify-between items-center gap-3 bg-ink/[0.01] dark:bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Cohort List:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                {students.length} Active Students
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('PRESENT')}
                disabled={students.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-semibold hover:bg-green-500/10 disabled:opacity-40 transition-colors"
              >
                <Check size={14} /> Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('ABSENT')}
                disabled={students.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 disabled:opacity-40 transition-colors"
              >
                <X size={14} /> Mark All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.02] dark:bg-white/[0.02]">
                  <th className="px-5 py-3 font-semibold w-32">Roll No.</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold w-48 text-center">Status</th>
                  <th className="px-5 py-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Loading cohort data...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <ShieldAlert size={28} className="text-amber-500" />
                        <p className="font-medium text-sm">No active students found in this course/cohort.</p>
                        <p className="text-xs text-ink/40 dark:text-paper/40">Assign active students to this department & course first.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && students.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01] transition-colors align-middle"
                  >
                    <td className="px-5 py-3 font-medium whitespace-nowrap">{s.rollNumber}</td>
                    <td className="px-5 py-3 font-medium text-ink/90 dark:text-paper/90 whitespace-nowrap">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center">
                        <div className="flex rounded-lg overflow-hidden border border-ink/15 dark:border-white/15 p-0.5 bg-ink/[0.03] dark:bg-white/[0.03]" role="group">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'PRESENT')}
                            className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all duration-150 ${
                              attendanceMap[s.id]?.status === 'PRESENT'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper hover:bg-ink/5 dark:hover:bg-white/5'
                            }`}
                          >
                            PRESENT
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'ABSENT')}
                            className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all duration-150 ${
                              attendanceMap[s.id]?.status === 'ABSENT'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper hover:bg-ink/5 dark:hover:bg-white/5'
                            }`}
                          >
                            ABSENT
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={attendanceMap[s.id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                        placeholder="Add remark..."
                        className="w-full px-3 py-1 rounded-md border border-ink/10 dark:border-white/10 bg-transparent text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save Action Footer */}
          {!loading && students.length > 0 && (
            <div className="p-4 border-t border-ink/10 dark:border-white/10 flex justify-end bg-ink/[0.01] dark:bg-white/[0.01]">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Attendance
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
