import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const MyCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '', discountType: 'percent', discountValue: '',
    minOrderAmount: '', maxUses: '', expiresAt: '',
  });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    try {
      const { data } = await API.get('/coupons/my');
      setCoupons(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/coupons', form);
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '' });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Coupons</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
              <input
                type="text" value={form.code} required
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. SAVE20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value ({form.discountType === 'percent' ? '%' : '₹'})
              </label>
              <input
                type="number" value={form.discountValue} required min="1"
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Amount (₹)</label>
              <input
                type="number" value={form.minOrderAmount} min="0"
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses</label>
              <input
                type="number" value={form.maxUses} min="1"
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input
                type="date" value={form.expiresAt} required
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit" disabled={creating}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🎟️</p>
          <p>No coupons yet. Create one to attract buyers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => {
            const now = new Date();
            const isExpired = new Date(coupon.expiresAt) < now;

            return (
              <div key={coupon._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono font-bold text-lg text-blue-600">{coupon.code}</span>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className={`text-sm font-medium ${
                  new Date(coupon.expiresAt) < new Date()
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {coupon.discountType === 'percent'
                    ? `${coupon.discountValue}% off`
                    : `₹${coupon.discountValue} off`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Min order: ₹{coupon.minOrderAmount}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Used: {coupon.usedCount}/{coupon.maxUses}
                </p>
                <p className={`text-sm font-medium ${
                  new Date(coupon.expiresAt) < new Date()
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${
                  isExpired
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    : coupon.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}>
                  {isExpired ? '⏰ Expired' : coupon.isActive ? '✓ Active' : 'Inactive'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCoupons;