import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/orders/seller');
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}/status`, { status });
      setOrders(orders.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Buyer', 'Amount (₹)', 'Status', 'Payment', 'Address', 'Date'];
    const rows = orders.map((order) => [
      order._id,
      order.buyer?.name || 'N/A',
      order.totalAmount,
      order.status,
      order.paymentStatus,
      order.shippingAddress,
      new Date(order.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller_orders_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported successfully!');
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Seller Orders</h1>
        {orders.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium flex items-center gap-2"
          >
            ⬇ Export CSV
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl p-3 text-center transition border ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              <p className="text-lg font-bold">
                {s === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === s).length}
              </p>
              <p className="text-xs capitalize">{s}</p>
            </button>
          ))}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📋</p>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">

              {/* Order Header */}
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order._id.slice(-8)}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Buyer: <span className="font-medium text-gray-700 dark:text-gray-300">{order.buyer?.name}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Address: {order.shippingAddress}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.filter((i) => i.product).map((item, i) => (
                  <div key={i} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                      className="w-12 h-12 object-cover rounded-lg"
                      alt={item.product?.name}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">{item.product?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex justify-between items-center flex-wrap gap-3 border-t dark:border-gray-700 pt-3">
                <div>
                  <p className="font-bold text-blue-600 text-lg">₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Payment:{' '}
                    <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;