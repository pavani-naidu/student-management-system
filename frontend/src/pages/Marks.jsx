import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, AlertCircle, FileSpreadsheet, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';

export default function Marks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryExamId = searchParams.get('examId');

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // studentId -> { obtainedMarks: '', remarks: '' }
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch all exams for the dropdown selection
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiClient.get('/exams');
        const examList = res.data.data || [];
        setExams(examList);

        if (queryExamId) {
          setSelectedExamId(queryExamId);
        } else if (examList.length > 0) {
          setSelectedExamId(examList[0].id.toString());
        }
      } catch (err) {
        toast.error('Failed to load examinations');
      }
    };
    fetchExams();
  }, [queryExamId]);

  // Handle selected exam changes
  useEffect(() => {
    if (selectedExamId) {
      const exam = exams.find((e) => e.id.toString() === selectedExamId);
      setSelectedExam(exam || null);
    } else {
      setSelectedExam(null);
    }
  }, [selectedExamId, exams]);

  // Load cohort students and existing marks
  const loadMarksSheet = useCallback(async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      // 1. Fetch cohort students belonging to the exam's course
      const studentsRes = await apiClient.get('/students', {
        params: {
          courseId: selectedExam.courseId,
          status: 'ACTIVE',
          page: 0,
          size: 1000
        }
      });
      const cohortList = studentsRes.data.data.content || [];
      setStudents(cohortList);

      // 2. Fetch already recorded marks for this exam
      const marksRes = await apiClient.get('/marks', {
        params: {
          examId: selectedExam.id
        }
      });
      const recordedMarks = marksRes.data.data || [];

      // 3. Map recorded marks by studentId
      const marksRecords = {};
      recordedMarks.forEach((m) => {
        marksRecords[m.studentId] = {
          obtainedMarks: m.obtainedMarks.toString(),
          remarks: m.remarks || ''
        };
      });

      // 4. Build sheet initial state
      const initialMap = {};
      cohortList.forEach((st) => {
        if (marksRecords[st.id]) {
          initialMap[st.id] = marksRecords[st.id];
        } else {
          initialMap[st.id] = {
            obtainedMarks: '',
            remarks: ''
          };
        }
      });
      setMarksMap(initialMap);
    } catch (err) {
      toast.error('Failed to load marks entry sheet');
    } finally {
      setLoading(false);
    }
  }, [selectedExam]);

  useEffect(() => {
    loadMarksSheet();
  }, [selectedExam, loadMarksSheet]);

  const handleMarkChange = (studentId, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtainedMarks: value
      }
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value
      }
    }));
  };

  const handleSave = async () => {
    if (students.length === 0) {
      toast.error('No students to save marks for');
      return;
    }

    // Validation
    const records = [];
    const max = selectedExam.maxMarks;

    for (let st of students) {
      const markVal = marksMap[st.id]?.obtainedMarks;
      if (markVal === undefined || markVal === '') {
        toast.error(`Please enter marks for ${st.firstName} ${st.lastName} (or enter 0)`);
        return;
      }
      
      const numMark = Number(markVal);
      if (isNaN(numMark) || numMark < 0 || numMark > max) {
        toast.error(`Marks for ${st.firstName} ${st.lastName} must be a number between 0 and ${max}`);
        return;
      }

      records.push({
        studentId: st.id,
        obtainedMarks: numMark,
        remarks: marksMap[st.id]?.remarks || ''
      });
    }

    setSaving(true);
    try {
      const payload = {
        examId: selectedExam.id,
        records
      };

      await apiClient.post('/marks/bulk', payload);
      toast.success('Marks recorded successfully');
      loadMarksSheet(); // Reload to refresh details
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/examinations"
            className="p-1.5 rounded-lg border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
              <FileSpreadsheet className="text-amber-500" /> Enter Cohort Marks
            </h1>
            <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
              Record assessment scores for examinations.
            </p>
          </div>
        </div>
      </div>

      {/* Select Exam Dropdown */}
      <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/70 dark:text-paper/70">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="" disabled>Select Examination</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.courseName})
              </option>
            ))}
          </select>
        </div>

        {selectedExam && (
          <div className="flex items-center gap-5 p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                Examination Details
              </span>
              <div className="grid grid-cols-3 gap-x-6 gap-y-1 mt-1 text-xs">
                <div>
                  <span className="text-ink/50 dark:text-paper/50">Max Marks: </span>
                  <span className="font-bold text-ink/90 dark:text-paper/90">{selectedExam.maxMarks}</span>
                </div>
                <div>
                  <span className="text-ink/50 dark:text-paper/50">Passing Marks: </span>
                  <span className="font-bold text-amber-500">{selectedExam.passingMarks}</span>
                </div>
                <div>
                  <span className="text-ink/50 dark:text-paper/50">Date: </span>
                  <span className="font-semibold text-ink/80 dark:text-paper/80">{selectedExam.date || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marks sheet cohort list */}
      {selectedExam && (
        <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
          <div className="p-4 border-b border-ink/10 dark:border-white/10 flex justify-between items-center bg-ink/[0.01] dark:bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Assessment Cohort:</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-bold">
                {students.length} Students enrolled in {selectedExam.courseName}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.02] dark:bg-white/[0.02]">
                  <th className="px-5 py-3.5 font-semibold w-32">Roll No.</th>
                  <th className="px-5 py-3.5 font-semibold">Student Name</th>
                  <th className="px-5 py-3.5 font-semibold w-40">Obtained Marks</th>
                  <th className="px-5 py-3.5 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Loading sheet data...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-ink/50 dark:text-paper/50">
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <AlertCircle size={28} className="text-amber-500" />
                        <p className="font-medium text-sm">No active students found in this exam's course.</p>
                        <p className="text-xs text-ink/40 dark:text-paper/40">Assign active students to course "{selectedExam.courseName}" first.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && students.map((student) => {
                  const markData = marksMap[student.id] || { obtainedMarks: '', remarks: '' };
                  const obtained = Number(markData.obtainedMarks);
                  const isInvalid = markData.obtainedMarks !== '' && (isNaN(obtained) || obtained < 0 || obtained > selectedExam.maxMarks);
                  const isPassed = markData.obtainedMarks !== '' && !isInvalid && (obtained >= selectedExam.passingMarks);

                  return (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01] transition-colors align-middle"
                    >
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">{student.rollNumber}</td>
                      <td className="px-5 py-3.5 font-medium text-ink/90 dark:text-paper/90 whitespace-nowrap">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={selectedExam.maxMarks}
                            value={markData.obtainedMarks}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            placeholder={`0 - ${selectedExam.maxMarks}`}
                            className={`w-28 px-3 py-1.5 rounded-lg border text-sm focus:ring-2 outline-none transition-all ${
                              isInvalid
                                ? 'border-red-500 focus:ring-red-500/20 bg-red-500/5'
                                : markData.obtainedMarks !== ''
                                ? isPassed
                                  ? 'border-green-500 focus:ring-green-500/20 bg-green-500/5'
                                  : 'border-amber-500 focus:ring-amber-500/20 bg-amber-500/5'
                                : 'border-ink/15 dark:border-white/15 bg-transparent focus:ring-amber-500'
                            }`}
                          />
                          {markData.obtainedMarks !== '' && !isInvalid && (
                            <span className={`text-xs font-bold whitespace-nowrap ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
                              {isPassed ? 'PASS' : 'FAIL'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <input
                          type="text"
                          value={markData.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="e.g. Good performance, improvement needed"
                          className="w-full px-3 py-1.5 rounded-lg border border-ink/10 dark:border-white/10 bg-transparent text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          {!loading && students.length > 0 && (
            <div className="p-4 border-t border-ink/10 dark:border-white/10 flex justify-between items-center bg-ink/[0.01] dark:bg-white/[0.01]">
              <span className="text-xs text-ink/50 dark:text-paper/50 flex items-center gap-1">
                <ShieldCheck size={14} className="text-green-500" /> Pre-validates marks boundary check on input
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Marks...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Save Marks
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
