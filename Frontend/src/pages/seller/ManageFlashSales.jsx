import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import FlashSaleTimer from '../../components/FlashSaleTimer';
import toast from 'react-hot-toast';

const ManageFlashSales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    discountPercent: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          API.get('/flash-sales/my'),
          API.get('/products/seller/my'),
        ]);
        setSales(salesRes.data);
        setProducts(productsRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await API.post('/flash-sales', form);
      setSales([data, ...sales]);
      setShowForm(false);
      setForm({ productId: '', discountPercent: '', startTime: '', endTime: '' });
      toast.success('Flash sale created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create flash sale');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flash sale?')) return;
    try {
      await API.delete(`/flash-sales/${id}`);
      setSales(sales.filter((s) => s._id !== id));
      toast.success('Flash sale deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isActive = (sale) => {
    const now = new Date();
    return sale.isActive && new Date(sale.startTime) <= now && new Date(sale.endTime) >= now;
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">⚡ Flash Sales</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Sale'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">New Flash Sale</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Product
              </label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                required
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Choose a product...</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                required min="1" max="99"
                placeholder="e.g. 30"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sale Price Preview
              </label>
              <div className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                {form.productId && form.discountPercent ? (
                  <>
                    ₹{Math.round(
                      (products.find(p => p._id === form.productId)?.price || 0) *
                      (1 - form.discountPercent / 100)
                    )}
                    <span className="text-gray-400 ml-2">
                      (Save {form.discountPercent}%)
                    </span>
                  </>
                ) : '—'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 transition"
              >
                {creating ? 'Creating...' : '⚡ Create Flash Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales List */}
      {sales.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-5xl mb-4">⚡</p>
          <p>No flash sales yet. Create one to boost your sales!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex gap-4 items-center flex-wrap">
              <img
                src={sale.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                alt={sale.product?.name}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-gray-800 dark:text-white truncate">
                    {sale.product?.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isActive(sale)
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isActive(sale) ? '🟢 Live' : '⏸ Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-red-600 font-bold">₹{sale.salePrice}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-sm line-through">
                    ₹{sale.originalPrice}
                  </span>
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                    -{sale.discountPercent}%
                  </span>
                </div>
                {isActive(sale) && (
                  <div className="mt-2">
                    <FlashSaleTimer endTime={sale.endTime} size="sm" />
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(sale.startTime).toLocaleDateString()} →{' '}
                  {new Date(sale.endTime).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(sale._id)}
                className="text-xs bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageFlashSales;