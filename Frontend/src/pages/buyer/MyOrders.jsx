import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import OrderTimeline from '../../components/OrderTimeline';
import { useCart } from '../../context/CartContext';
import generateInvoice from '../../utils/generateInvoice';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(null);
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/orders/my');
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleReorder = async (order) => {
    setReordering(order._id);
    try {
      for (const item of order.items) {
        if (item.product) {
          await API.post('/cart', {
            productId: item.product._id,
            quantity: item.quantity,
          });
        }
      }
      fetchCartCount();
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch {
      toast.error('Failed to reorder. Some products may be unavailable.');
    } finally {
      setReordering(null);
    }
  };

  const handleDownloadInvoice = (order) => {
    try {
      generateInvoice(order);
      toast.success('Invoice downloaded!');
    } catch {
      toast.error('Failed to generate invoice');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg mb-4">No orders yet</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">

              {/* Order Header */}
              <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID:{' '}
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      {order._id}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Placed on:{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>

              {/* Order Timeline */}
              {order.status !== 'cancelled' && (
                <OrderTimeline status={order.status} />
              )}

              {/* Order Items */}
              <div className="space-y-3 mt-4 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {item.product?.name || 'Product unavailable'}
                      </p>
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
              <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center flex-wrap gap-2 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Payment:{' '}
                    <span className={`font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Shipping to: {order.shippingAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-xl font-bold text-blue-600">₹{order.totalAmount}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {/* Download Invoice - only for paid orders */}
                {order.paymentStatus === 'paid' && (
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
                  >
                    📄 Download Invoice
                  </button>
                )}

                {/* Reorder - only for delivered orders */}
                {order.status === 'delivered' && (
                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reordering === order._id}
                    className="flex-1 border border-blue-500 text-blue-600 py-2 rounded-xl text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {reordering === order._id ? 'Adding...' : '🔄 Reorder'}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;