import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, DollarSign, CreditCard, Clock, CheckCircle2, AlertCircle, X, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../api/axiosClient';

export default function MyFees() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Payment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchMyFees = async () => {
    try {
      const res = await apiClient.get('/fees/my');
      setData(res.data.data);
      // Pre-fill payment amount with outstanding if greater than 0
      const outstanding = res.data.data?.totalOutstanding || 0;
      setAmount(outstanding > 0 ? outstanding.toString() : '500');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your fee record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees();
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setProcessing(true);

    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(async () => {
      try {
        await apiClient.post('/fees', {
          amount: Number(amount),
          feeType,
          paymentMethod,
          status: 'PAID',
          remarks: `Online Payment via ${paymentMethod} (Mock)`
        });

        toast.success(`Payment of $${amount} successful!`);
        setIsModalOpen(false);
        // Reset card details
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCardCvv('');
        setUpiId('');
        // Refresh logs
        fetchMyFees();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Mock payment failed to register');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-ink/60 dark:text-paper/60">Loading fee records...</p>
      </div>
    );
  }

  const totalPaid = data?.totalPaid ?? 0;
  const totalPending = data?.totalPending ?? 0;
  const totalOutstanding = data?.totalOutstanding ?? 5000;
  const history = data?.history ?? [];

  const statusConfig = {
    PAID: { color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle2 },
    PENDING: { color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Clock },
    FAILED: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertCircle }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Landmark className="text-indigo-600 dark:text-indigo-400" /> My Fee Balance
          </h1>
          <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
            View outstanding fees, pending bills, and make payments online.
          </p>
        </div>
        <button
          onClick={() => {
            setAmount(totalOutstanding > 0 ? totalOutstanding.toString() : '500');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-600/15 transition duration-200"
        >
          <CreditCard size={18} /> Pay Fees Now
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Outstanding */}
        <div className="glass rounded-badge p-5 shadow-card border border-rose-500/10 bg-gradient-to-br from-rose-500/[0.02] to-transparent flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">Total Outstanding</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">${totalOutstanding.toFixed(2)}</div>
            <div className="text-xxs text-ink/40 dark:text-paper/40 mt-0.5">Calculated out of $5000 tuition model</div>
          </div>
        </div>

        {/* Total Paid */}
        <div className="glass rounded-badge p-5 shadow-card border border-emerald-500/10 bg-gradient-to-br from-emerald-500/[0.02] to-transparent flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">Total Paid</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalPaid.toFixed(2)}</div>
            <div className="text-xxs text-ink/40 dark:text-paper/40 mt-0.5">Confirmed successful payments</div>
          </div>
        </div>

        {/* Pending Bills */}
        <div className="glass rounded-badge p-5 shadow-card border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.02] to-transparent flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">Pending Bills</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">${totalPending.toFixed(2)}</div>
            <div className="text-xxs text-ink/40 dark:text-paper/40 mt-0.5">Payments awaiting confirmation</div>
          </div>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="glass rounded-badge shadow-card border border-ink/5 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-ink/10 dark:border-white/10 flex justify-between items-center bg-ink/[0.01] dark:bg-white/[0.01]">
          <h2 className="font-display font-semibold text-base">Payment Logs</h2>
          <span className="text-xs text-ink/50 dark:text-paper/50">{history.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 dark:border-white/10 text-left bg-ink/[0.01] dark:bg-white/[0.01]">
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Fee Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Remarks</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink/50 dark:text-paper/50">
                    No transactions registered yet.
                  </td>
                </tr>
              ) : (
                history.map((tx) => {
                  const StatusIcon = statusConfig[tx.status]?.icon || Clock;
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-ink/5 dark:border-white/5 hover:bg-ink/[0.01] dark:hover:bg-white/[0.01]"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{tx.transactionId || '—'}</td>
                      <td className="px-4 py-3 font-medium">{tx.feeType}</td>
                      <td className="px-4 py-3 font-semibold">${tx.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">{new Date(tx.paymentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{tx.paymentMethod}</td>
                      <td className="px-4 py-3 text-ink/60 dark:text-paper/60 max-w-[200px] truncate" title={tx.remarks}>
                        {tx.remarks || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[tx.status]?.color}`}>
                          <StatusIcon size={12} /> {tx.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Fees Premium Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-paper dark:bg-slate-850 rounded-badge shadow-card border border-ink/10 dark:border-white/10 p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 border-b border-ink/10 dark:border-white/10 pb-3">
                <div>
                  <h2 className="font-display text-lg font-bold flex items-center gap-2">
                    <CreditCard className="text-indigo-600 dark:text-indigo-400" /> Premium Pay Portal
                  </h2>
                  <p className="text-xxs text-ink/50 dark:text-paper/50">Secure instant tuition settlement</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-ink/10 dark:hover:bg-white/10 text-ink/50 dark:text-paper/50 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePay} className="space-y-4">
                {/* Fee Type Selection */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">
                    Select Fee Bill
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

                {/* Amount to Pay */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">
                    Payment Amount ($)
                  </label>
                  <div className="relative mt-1">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper/40" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-semibold transition"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink/50 dark:text-paper/50">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                        paymentMethod === 'UPI'
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                          : 'border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5'
                      }`}
                    >
                      UPI / QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition ${
                        paymentMethod === 'Card'
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                          : 'border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5'
                      }`}
                    >
                      Credit/Debit Card
                    </button>
                  </div>
                </div>

                {/* Payment Details Fields */}
                <div className="p-3 bg-ink/[0.02] dark:bg-white/[0.02] rounded-lg border border-ink/5 dark:border-white/5">
                  {paymentMethod === 'UPI' ? (
                    <div>
                      <label className="text-xs font-semibold text-ink/60 dark:text-paper/60">UPI Address</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. rollnumber@paytm"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-ink/60 dark:text-paper/60">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-ink/60 dark:text-paper/60">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          placeholder="e.g. 4532 9845 2314 0092"
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-ink/60 dark:text-paper/60">Expiry Date</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                              }
                              setCardExpiry(val);
                            }}
                            placeholder="MM/YY"
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-ink/60 dark:text-paper/60">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="***"
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-ink/15 dark:border-white/15 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secure Badge */}
                <div className="flex items-center gap-2 text-xxs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>Payments are processed with 256-bit encryption. This is a simulated transaction.</span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 border-t border-ink/10 dark:border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium border border-ink/15 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-md shadow-emerald-600/10 transition duration-200 disabled:opacity-50 min-w-[120px]"
                  >
                    {processing ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Paying...
                      </span>
                    ) : (
                      `Pay $${amount || '0'}`
                    )}
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
