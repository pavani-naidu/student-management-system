import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const emptyForm = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  departmentId: '',
  designation: '',
  joiningDate: '',
  status: 'ACTIVE',
};

export default function TeacherFormModal({ open, onClose, onSave, teacher, departments, saving }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (teacher) {
      setForm({
        employeeId: teacher.employeeId ?? '',
        firstName: teacher.firstName ?? '',
        lastName: teacher.lastName ?? '',
        email: teacher.email ?? '',
        mobileNumber: teacher.mobileNumber ?? '',
        departmentId: teacher.departmentId ?? '',
        designation: teacher.designation ?? '',
        joiningDate: teacher.joiningDate ?? '',
        status: teacher.status ?? 'ACTIVE',
      });
    } else {
      setForm(emptyForm);
    }
  }, [teacher, open]);

  if (!open) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      joiningDate: form.joiningDate || null,
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
          <h2 className="font-display text-xl font-semibold">{teacher ? 'Edit Teacher' : 'Add Teacher'}</h2>
          <button onClick={onClose} className="text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <Field label="Employee ID" required value={form.employeeId} onChange={(v) => update('employeeId', v)} />
          <Field label="Email" type="email" required value={form.email} onChange={(v) => update('email', v)} />
          <Field label="First Name" required value={form.firstName} onChange={(v) => update('firstName', v)} />
          <Field label="Last Name" required value={form.lastName} onChange={(v) => update('lastName', v)} />

          <Field label="Mobile Number" value={form.mobileNumber} onChange={(v) => update('mobileNumber', v)} />
          <Field label="Designation" value={form.designation} onChange={(v) => update('designation', v)} />

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

          <Field label="Joining Date" type="date" value={form.joiningDate} onChange={(v) => update('joiningDate', v)} />

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
              {saving ? 'Saving...' : teacher ? 'Save changes' : 'Add teacher'}
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
