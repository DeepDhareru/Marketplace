import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const EarningsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', bankDetails: '' });
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/payouts/earnings');
        setData(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (!payoutForm.amount || payoutForm.amount <= 0) {
      return toast.error('Enter a valid amount');
    }
    if (payoutForm.amount > data.summary.totalPending) {
      return toast.error('Amount exceeds pending earnings');
    }
    setRequesting(true);
    try {
      await API.post('/payouts/request', payoutForm);
      toast.success('Payout request submitted!');
      setShowPayoutForm(false);
      setPayoutForm({ amount: '', bankDetails: '' });
      const { data: refreshed } = await API.get('/payouts/earnings');
      setData(refreshed);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Loader />;

  const { summary, monthlyBreakdown, recentEarnings, payouts } = data;

  const STATUS_STYLES = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    processing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Earnings & Payouts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Platform fee: {summary.platformFeePercent}% per order
          </p>
        </div>
        {summary.totalPending > 0 && (
          <button
            onClick={() => setShowPayoutForm(!showPayoutForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            💸 Request Payout
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Gross Sales', value: `₹${summary.totalGross}`, color: 'text-gray-800 dark:text-white' },
          { label: 'Platform Fee', value: `₹${summary.totalFees}`, color: 'text-red-600 dark:text-red-400' },
          { label: 'Net Earned', value: `₹${summary.totalEarned}`, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Paid Out', value: `₹${summary.totalPaid}`, color: 'text-green-600 dark:text-green-400' },
          { label: 'Pending', value: `₹${summary.totalPending}`, color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Orders', value: summary.totalOrders, color: 'text-purple-600 dark:text-purple-400' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 text-center">
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Payout Request Form */}
      {showPayoutForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-green-200 dark:border-green-800">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Request Payout</h2>
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount (₹) — Max ₹{summary.totalPending}
              </label>
              <input
                type="number"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                max={summary.totalPending}
                min={1}
                required
                placeholder={`Max ₹${summary.totalPending}`}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bank Account Details
              </label>
              <textarea
                value={payoutForm.bankDetails}
                onChange={(e) => setPayoutForm({ ...payoutForm, bankDetails: e.target.value })}
                rows={2}
                placeholder="Account Number, IFSC Code, Bank Name..."
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPayoutForm(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requesting}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {requesting ? 'Requesting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monthly Chart */}
      {monthlyBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Monthly Earnings</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val, name) => [`₹${val}`, name]} />
              <Legend />
              <Bar dataKey="gross" name="Gross" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Earnings */}
      {recentEarnings.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Earnings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2 text-right">Gross</th>
                  <th className="pb-2 text-right">Fee (5%)</th>
                  <th className="pb-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {recentEarnings.map((e) => (
                  <tr key={e.orderId} className="border-b dark:border-gray-700 last:border-0">
                    <td className="py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      #{e.orderId.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="py-2.5 text-gray-600 dark:text-gray-300">
                      {new Date(e.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short',
                      })}
                    </td>
                    <td className="py-2.5 text-right text-gray-700 dark:text-gray-300">
                      ₹{e.grossAmount}
                    </td>
                    <td className="py-2.5 text-right text-red-500 dark:text-red-400">
                      -₹{e.platformFee}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-green-600 dark:text-green-400">
                      ₹{e.netAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm">No payout requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => {
              const style = STATUS_STYLES[payout.status];
              return (
                <div key={payout._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      ₹{payout.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {payout.note && ` · ${payout.note}`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;