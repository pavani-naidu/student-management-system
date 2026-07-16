import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const emptyForm = {
  rollNumber: '', firstName: '', lastName: '', gender: 'MALE', dateOfBirth: '',
  bloodGroup: '', mobileNumber: '', email: '', address: '', parentName: '',
  parentMobile: '', departmentId: '', courseId: '', semester: '', section: '',
  admissionDate: '', status: 'ACTIVE',
};

export default function StudentFormModal({ open, onClose, onSave, student, departments, courses, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (student) {
      setForm({
        rollNumber: student.rollNumber ?? '',
        firstName: student.firstName ?? '',
        lastName: student.lastName ?? '',
        gender: student.gender ?? 'MALE',
        dateOfBirth: student.dateOfBirth ?? '',
        bloodGroup: student.bloodGroup ?? '',
        mobileNumber: student.mobileNumber ?? '',
        email: student.email ?? '',
        address: student.address ?? '',
        parentName: student.parentName ?? '',
        parentMobile: student.parentMobile ?? '',
        departmentId: student.departmentId ?? '',
        courseId: student.courseId ?? '',
        semester: student.semester ?? '',
        section: student.section ?? '',
        admissionDate: student.admissionDate ?? '',
        status: student.status ?? 'ACTIVE',
      });
    } else {
      setForm(emptyForm);
    }
  }, [student, open]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      courseId: form.courseId ? Number(form.courseId) : null,
      semester: form.semester ? Number(form.semester) : null,
      dateOfBirth: form.dateOfBirth || null,
      admissionDate: form.admissionDate || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-paper dark:bg-slate-850 rounded-badge shadow-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-semibold">{student ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Roll Number" required value={form.rollNumber} onChange={(v) => update('rollNumber', v)} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
          <Field label="First Name" required value={form.firstName} onChange={(v) => update('firstName', v)} />
          <Field label="Last Name" required value={form.lastName} onChange={(v) => update('lastName', v)} />

          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => update('dateOfBirth', v)} />

          <Field label="Blood Group" value={form.bloodGroup} onChange={(v) => update('bloodGroup', v)} />
          <Field label="Mobile Number" required value={form.mobileNumber} onChange={(v) => update('mobileNumber', v)} />

          <Field label="Parent Name" value={form.parentName} onChange={(v) => update('parentName', v)} />
          <Field label="Parent Mobile" value={form.parentMobile} onChange={(v) => update('parentMobile', v)} />

          <div className="sm:col-span-2">
            <Field label="Address" value={form.address} onChange={(v) => update('address', v)} />
          </div>

          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => update('departmentId', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
            >
              <option value="">— Select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Course</label>
            <select
              value={form.courseId}
              onChange={(e) => update('courseId', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
            >
              <option value="">— Select —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Field label="Semester" type="number" value={form.semester} onChange={(v) => update('semester', v)} />
          <Field label="Section" value={form.section} onChange={(v) => update('section', v)} />

          <Field label="Admission Date" type="date" value={form.admissionDate} onChange={(v) => update('admissionDate', v)} />
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : student ? 'Save changes' : 'Add student'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}{required && <span className="text-amber-600"> *</span>}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent focus:ring-2 focus:ring-amber-500 outline-none"
      />
    </div>
  );
}
