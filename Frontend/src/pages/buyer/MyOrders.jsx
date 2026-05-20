import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import OrderTimeline from '../../components/OrderTimeline';

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

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow p-6">

              {/* Order Header */}
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID: <span className="font-mono text-gray-700">{order._id}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
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
                  <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                    <img
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.product?.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.product?.name || 'Product unavailable'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="border-t pt-4 flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Payment:{' '}
                    <span className={`font-medium ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Shipping to: {order.shippingAddress}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-blue-600">₹{order.totalAmount}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;