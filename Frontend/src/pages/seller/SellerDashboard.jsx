import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, 
} from 'recharts';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('revenue');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          API.get('/products/seller/my'),
          API.get('/orders/seller'),
        ]);

        const orders = ordersRes.data;
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        // Build monthly chart data
        const monthlyMap = {};
        orders.forEach((order) => {
          const month = new Date(order.createdAt).toLocaleString('default', {
            month: 'short', year: '2-digit'
          });
          if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, orders: 0 };
          monthlyMap[month].revenue += order.totalAmount;
          monthlyMap[month].orders += 1;
        });
        const chartData = Object.values(monthlyMap).slice(-6);

        setStats({
          totalProducts: productsRes.data.length,
          totalOrders: orders.length,
          totalRevenue,
          recentOrders: orders.slice(0, 5),
          chartData,
          lowStock: productsRes.data.filter(p => p.stock <= 5),
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'bg-blue-50 dark:bg-blue-900 text-blue-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: 'bg-green-50 dark:bg-green-900 text-green-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: '💰', color: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600' },
    { label: 'Low Stock', value: stats.lowStock.length, icon: '⚠️', color: 'bg-red-50 dark:bg-red-900 text-red-600' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Seller Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.color} bg-opacity-40`}>
            <p className="text-3xl mb-2">{card.icon}</p>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Warning */}
      {stats.lowStock.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-6">
          <p className="font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Low Stock Alert</p>
          <div className="flex flex-wrap gap-2">
            {stats.lowStock.map((p) => (
              <span
                key={p._id}
                onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-red-200 transition"
              >
                {p.name} ({p.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="font-semibold text-gray-800 dark:text-white">Sales Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('revenue')}
              className={`text-sm px-4 py-1.5 rounded-full border transition ${
                chartType === 'revenue'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartType('orders')}
              className={`text-sm px-4 py-1.5 rounded-full border transition ${
                chartType === 'orders'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 dark:text-gray-300 hover:border-blue-400'
              }`}
            >
              Orders
            </button>
          </div>
        </div>

        {stats.chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📊</p>
            <p>No data yet. Sales will appear here once orders come in.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {chartType === 'revenue' ? (
              <LineChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [val, 'Orders']} />
                <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Buyer</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2 font-mono text-xs text-gray-500">{order._id.slice(-8)}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">{order.buyer?.name}</td>
                  <td className="py-2 font-medium text-blue-600">₹{order.totalAmount}</td>
                  <td className="py-2">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;