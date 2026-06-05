import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const REASONS = [
  'Defective / Damaged product',
  'Wrong item received',
  'Product not as described',
  'Size / fit issue',
  'Changed my mind',
  'Other',
];

const RequestReturn = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    reason: '',
    description: '',
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/orders/my');
        const found = data.find((o) => o._id === orderId);
        if (!found) {
          toast.error('Order not found');
          navigate('/my-orders');
          return;
        }
        setOrder(found);
      } catch {
        toast.error('Failed to load order');
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason) return toast.error('Please select a return reason');
    setSubmitting(true);
    try {
      await API.post('/returns', {
        orderId,
        reason: form.reason,
        description: form.description,
      });
      toast.success('Return request submitted!');
      navigate('/my-returns');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/my-orders')}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 transition mb-6 text-sm"
      >
        ← Back to Orders
      </button>

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Request Return
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Returns are accepted within 7 days of delivery. Refund will be credited to your wallet.
      </p>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Order Items
        </p>
        <div className="space-y-3">
          {order?.items?.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img
                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                alt={item.product?.name}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">
                  {item.product?.name || 'Product'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
              <p className="font-semibold text-gray-800 dark:text-white text-sm">
                ₹{item.quantity * item.price}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t dark:border-gray-700 pt-3 mt-3 flex justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Refund Amount</span>
          <span className="font-bold text-blue-600">₹{order?.totalAmount}</span>
        </div>
      </div>

      {/* Return Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Reason for Return
            </label>
            <div className="space-y-2">
              {REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                    form.reason === reason
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    form.reason === reason
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {form.reason === reason && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={form.reason === reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Additional Details
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              ℹ️ How refunds work
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Seller will review your request within 2-3 business days</li>
              <li>• If approved, ₹{order?.totalAmount} will be added to your wallet</li>
              <li>• Wallet credits can be used on your next purchase</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-orders')}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.reason}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RequestReturn;