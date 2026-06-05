import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '⏳ Pending' },
  approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '✅ Approved' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: '❌ Rejected' },
  refunded: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '💰 Refunded' },
};

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [noteText, setNoteText] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/returns/seller');
        setReturns(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAction = async (id, status) => {
    setActionId(id);
    try {
      const { data } = await API.put(`/returns/${id}/status`, {
        status,
        sellerNote: noteText[id] || '',
      });
      setReturns(returns.map((r) => (r._id === id ? data : r)));
      toast.success(`Return ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Loader />;

  const pendingReturns = returns.filter((r) => r.status === 'pending');
  const processedReturns = returns.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Return Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review and respond to buyer return requests
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: returns.length, color: 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white' },
          { label: 'Pending', value: returns.filter(r => r.status === 'pending').length, color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
          { label: 'Approved', value: returns.filter(r => r.status === 'approved').length, color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'Rejected', value: returns.filter(r => r.status === 'rejected').length, color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow">
          <p className="text-5xl mb-4">↩️</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No return requests</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">You'll see return requests here when buyers submit them</p>
        </div>
      ) : (
        <>
          {/* Pending Returns */}
          {pendingReturns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                Pending ({pendingReturns.length})
              </h2>
              <div className="space-y-4">
                {pendingReturns.map((ret) => (
                  <div key={ret._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-yellow-400">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {ret.buyer?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ret.buyer?.email} · {new Date(ret.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{ret.refundAmount}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-4">
                      {ret.items?.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-2">
                          <img
                            src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/40'}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                            alt={item.product?.name}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reason */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 mb-4">
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-0.5">
                        Return Reason
                      </p>
                      <p className="text-sm text-gray-800 dark:text-white font-medium">
                        {ret.reason}
                      </p>
                      {ret.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {ret.description}
                        </p>
                      )}
                    </div>

                    {/* Seller Note */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Response Note
                        <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
                      </label>
                      <textarea
                        value={noteText[ret._id] || ''}
                        onChange={(e) => setNoteText({ ...noteText, [ret._id]: e.target.value })}
                        rows={2}
                        placeholder="Add a note for the buyer..."
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(ret._id, 'approved')}
                        disabled={actionId === ret._id}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {actionId === ret._id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : '✓'} Approve & Refund
                      </button>
                      <button
                        onClick={() => handleAction(ret._id, 'rejected')}
                        disabled={actionId === ret._id}
                        className="flex-1 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
                      >
                        ✗ Reject
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processed Returns */}
          {processedReturns.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                Processed ({processedReturns.length})
              </h2>
              <div className="space-y-3">
                {processedReturns.map((ret) => {
                  const style = STATUS_STYLES[ret.status];
                  return (
                    <div key={ret._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex gap-4 items-center flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {ret.buyer?.name}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {ret.reason} · {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        {ret.sellerNote && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">
                            Note: {ret.sellerNote}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-gray-700 dark:text-gray-300 text-sm flex-shrink-0">
                        ₹{ret.refundAmount}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerReturns;