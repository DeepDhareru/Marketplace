import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/admin/orders');
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Orders</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-mono text-xs text-gray-500">{order._id.slice(-8)}</td>
                <td className="px-6 py-3 font-medium text-gray-800">{order.buyer?.name}</td>
                <td className="px-6 py-3 font-medium text-blue-600">₹{order.totalAmount}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;