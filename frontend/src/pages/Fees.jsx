import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Search, Plus, DollarSign, Calendar, CreditCard, RefreshCw, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export default function Fees() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Fee payments list state
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [rollNumberFilter, setRollNumberFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student search autocomplete states
  const [studentQuery, setStudentQuery] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Other form fields
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Status updating dropdown
  const [updatingId, setUpdatingId] = useState(null);

  // Debounce ref for student search
  const debounceRef = useRef(null);

  // Fetch payments list
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/fees', {
        params: {
          rollNumber: rollNumberFilter || undefined,
          status: statusFilter || undefined,
          feeType: feeTypeFilter || undefined
        }
      });
      setPayments(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load fee payments');
    } finally {
      setLoading(false);
    }
  }, [rollNumberFilter, statusFilter, feeTypeFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Autocomplete student search
  const handleStudentSearch = (val) => {
    setStudentQuery(val);
    if (!val.trim()) {
      setStudentResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchingStudents(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.get('/students', {
          params: { query: val, page: 0, size: 10 }
        });
        setStudentResults(res.data.data?.content || []);
      } catch (err) {
        console.error('Failed to search students', err);
      } finally {
        setSearchingStudents(false);
      }
    }, 400);
  };

  // Status mapping
  const statusConfig = {
    PAID: { color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
    PENDING: { color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Clock },
    FAILED: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertTriangle }
  };

  // Create payment handler
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await apiClient.post('/fees', {
        studentId: selectedStudent.id,
        amount: Number(amount),
        feeType,
        paymentMethod,
        status: paymentStatus,
        transactionId: transactionId || undefined,
        remarks: remarks || undefined
      });
      toast.success('Fee payment recorded successfully');
      setIsModalOpen(false);
      resetForm();
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  // Update Status handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiClient.put(`/fees/${id}/status`, null, {
        params: { status: newStatus }
      });
      toast.success('Status updated successfully');
      setUpdatingId(null);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setStudentQuery('');
    setStudentResults([]);
    setAmount('');
    setFeeType('Tuition Fee');
    setPaymentMethod('UPI');
    setPaymentStatus('PAID');
    setTransactionId('');
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Landmark className="text-indigo-600 dark:text-indigo-400" /> Fees Management
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            Track student payments, outstanding balances, and update fee records.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Record Payment
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-badge p-4 shadow-card border border-ink/5 dark:border-white/5 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40" />
          <input
            value={rollNumberFilter}
            onChange={(e) => setRollNumberFilter(e.target.value)}
            placeholder="Filter by Student Roll No..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <select
          value={feeTypeFilter}
          onChange={(e) => setFeeTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm min-w-[150px]"
        >
          <option value="">All Fee Types</option>
          <option value="Tuition Fee">Tuition Fee</option>
          <option value="Hostel Fee">Hostel Fee</option>
          <option value="Library Fee">Library Fee</option>
          <option value="Exam Fee">Exam Fee</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.01] dark:bg-white/[0.01]">
                <th className="px-4 py-3 font-semibold">Roll No.</th>
                <th className="px-4 py-3 font-semibold">Student Name</th>
                <th className="px-4 py-3 font-semibold">Fee Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {isAdmin && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-ink/50 dark:text-paper/50">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && payments.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-4 py-8 text-center text-ink/50 dark:text-paper/50">
                    No transactions found.
                  </td>
                </tr>
              )}
              {!loading && payments.map((p) => {
                const StatusIcon = statusConfig[p.status]?.icon || Clock;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01]"
                  >
                    <td className="px-4 py-3 font-medium">{p.studentRollNumber}</td>
                    <td className="px-4 py-3">{p.studentFirstName} {p.studentLastName}</td>
                    <td className="px-4 py-3">{p.feeType}</td>
                    <td className="px-4 py-3 font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{p.paymentMethod}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.transactionId || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[p.status]?.color}`}>
                        <StatusIcon size={12} /> {p.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block text-left">
                          {updatingId === p.id ? (
                            <select
                              defaultValue={p.status}
                              onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                              onBlur={() => setUpdatingId(null)}
                              className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded text-xs outline-none"
                              autoFocus
                            >
                              <option value="PAID">PAID</option>
                              <option value="PENDING">PENDING</option>
                              <option value="FAILED">FAILED</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setUpdatingId(p.id)}
                              className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 ml-auto px-2 py-1 rounded hover:bg-ink/5 dark:hover:bg-white/5 text-xs font-medium transition"
                            >
                              <RefreshCw size={12} /> Change Status
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-paper dark:bg-slate-850 rounded-badge shadow-card border border-ink/10 dark:border-white/10 p-6 overflow-visible"
            >
              {/* Modal Title */}
              <div className="flex items-center justify-between mb-4 border-b border-ink/10 dark:border-white/10 pb-3">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Landmark className="text-indigo-600 dark:text-indigo-400" /> Record Fee Payment
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-ink/10 dark:hover:bg-white/10 text-ink/50 dark:text-paper/50 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreatePayment} className="space-y-4">
                {/* Student Autocomplete Search */}
                <div className="relative">
                  <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                    Student Search (Name or Roll Number) *
                  </label>
                  {selectedStudent ? (
                    <div className="mt-1 flex items-center justify-between p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 text-sm font-medium">
                      <div>
                        <div className="text-indigo-600 dark:text-indigo-400">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </div>
                        <div className="text-xs text-ink/50 dark:text-paper/50">
                          Roll No: {selectedStudent.rollNumber} | Email: {selectedStudent.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(null)}
                        className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full text-indigo-500 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={studentQuery}
                        onChange={(e) => {
                          handleStudentSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Type roll number or student name..."
                        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                      {showDropdown && studentQuery && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-[160px] overflow-y-auto bg-white dark:bg-slate-800 border border-ink/15 dark:border-white/15 rounded-lg shadow-lg">
                          {searchingStudents && (
                            <div className="p-3 text-xs text-ink/50 dark:text-paper/50 text-center">Searching...</div>
                          )}
                          {!searchingStudents && studentResults.length === 0 && (
                            <div className="p-3 text-xs text-ink/50 dark:text-paper/50 text-center">No students found</div>
                          )}
                          {!searchingStudents && studentResults.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudent(s);
                                setShowDropdown(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-b border-ink/5 dark:border-white/5 last:border-b-0 transition flex flex-col"
                            >
                              <span className="text-sm font-semibold">{s.firstName} {s.lastName}</span>
                              <span className="text-xs text-ink/50 dark:text-paper/50">Roll No: {s.rollNumber}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                      Amount ($) *
                    </label>
                    <div className="relative mt-1">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Fee Type */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                      Fee Type
                    </label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="Tuition Fee">Tuition Fee</option>
                      <option value="Hostel Fee">Hostel Fee</option>
                      <option value="Library Fee">Library Fee</option>
                      <option value="Exam Fee">Exam Fee</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                      Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. TXN10293848"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-xs font-semibold uppercase text-ink/50 dark:text-paper/50 tracking-wider">
                    Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add comments or descriptions..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-ink/10 dark:border-white/10 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
