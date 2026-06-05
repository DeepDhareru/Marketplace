import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '⏳ Pending' },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '✅ Approved' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: '❌ Rejected' },
  refunded: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '💰 Refunded' },
};

const REASONS = [
  'Defective / Damaged product',
  'Wrong item received',
  'Product not as described',
  'Size / fit issue',
  'Changed my mind',
  'Other',
];

const MyReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/returns/my');
        setReturns(data);
      } catch {
        toast.error('Failed to load returns');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Returns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your return and refund requests
          </p>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow">
          <p className="text-5xl mb-4">↩️</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No return requests
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            You haven't submitted any return requests yet
          </p>
          <button
            onClick={() => navigate('/my-orders')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            View My Orders
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => {
            const style = STATUS_STYLES[ret.status];
            return (
              <div key={ret._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

                {/* Header */}
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Return ID:{' '}
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        #{ret._id.slice(-8).toUpperCase()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      Submitted:{' '}
                      {new Date(ret.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {ret.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
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

                {/* Reason */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Return Reason
                  </p>
                  <p className="text-sm text-gray-800 dark:text-white font-medium">
                    {ret.reason}
                  </p>
                  {ret.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {ret.description}
                    </p>
                  )}
                </div>

                {/* Seller Note */}
                {ret.sellerNote && (
                  <div className={`rounded-xl p-3 mb-4 ${
                    ret.status === 'rejected'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  }`}>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Seller Response
                    </p>
                    <p className={`text-sm font-medium ${
                      ret.status === 'rejected'
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {ret.sellerNote}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center border-t dark:border-gray-700 pt-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Refund Amount</p>
                    <p className="text-lg font-bold text-blue-600">₹{ret.refundAmount}</p>
                  </div>
                  {(ret.status === 'approved' || ret.status === 'refunded') && (
                    <div className="text-right">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ ₹{ret.refundAmount} added to your wallet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Use at checkout
                      </p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReturns;