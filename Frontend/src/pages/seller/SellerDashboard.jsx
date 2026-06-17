import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area,
} from 'recharts';
import {
  FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle,
  FiTrendingUp, FiTrendingDown, FiStar, FiUpload, FiZap,
  FiTag, FiCornerUpLeft, FiArrowRight, FiPlus, FiEye,
} from 'react-icons/fi';

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('revenue');
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [productsRes, ordersRes, returnsRes, earningsRes] = await Promise.all([
          API.get('/products/seller/my'),
          API.get('/orders/seller'),
          API.get('/returns/seller').catch(() => ({ data: [] })),
          API.get('/payouts/earnings').catch(() => ({ data: null })),
        ]);

        const products = productsRes.data;
        const orders = ordersRes.data;
        const returns = returnsRes.data;

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');

        // Build monthly chart data
        const monthlyMap = {};
        orders.forEach((order) => {
          const month = new Date(order.createdAt).toLocaleString('default', {
            month: 'short', year: '2-digit',
          });
          if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, orders: 0 };
          monthlyMap[month].revenue += order.totalAmount;
          monthlyMap[month].orders += 1;
        });
        const chartData = Object.values(monthlyMap).slice(-6);

        // This month vs last month comparison
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonthStart);
        const lastMonthOrders = orders.filter((o) =>
          new Date(o.createdAt) >= lastMonthStart && new Date(o.createdAt) < thisMonthStart
        );
        const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.totalAmount, 0);
        const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.totalAmount, 0);
        const revenueGrowth = lastMonthRevenue > 0
          ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
          : thisMonthRevenue > 0 ? 100 : 0;

        // Order status breakdown
        const statusCounts = {
          pending: orders.filter((o) => o.status === 'pending').length,
          processing: orders.filter((o) => o.status === 'processing').length,
          shipped: orders.filter((o) => o.status === 'shipped').length,
          delivered: orders.filter((o) => o.status === 'delivered').length,
        };

        // Top products by revenue
        const productRevenueMap = {};
        orders.forEach((order) => {
          order.items?.forEach((item) => {
            if (!item.product) return;
            const pid = item.product._id || item.product;
            const pname = item.product.name || 'Unknown';
            if (!productRevenueMap[pid]) {
              productRevenueMap[pid] = { name: pname, revenue: 0, sold: 0, image: item.product.images?.[0]?.url };
            }
            productRevenueMap[pid].revenue += item.price * item.quantity;
            productRevenueMap[pid].sold += item.quantity;
          });
        });
        const topProducts = Object.values(productRevenueMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          paidOrdersCount: paidOrders.length,
          pendingReturns: returns.filter((r) => r.status === 'pending').length,
          recentOrders: orders.slice(0, 5),
          chartData,
          lowStock: products.filter((p) => p.stock <= 5 && p.stock > 0),
          outOfStock: products.filter((p) => p.stock === 0),
          revenueGrowth,
          thisMonthRevenue,
          statusCounts,
          topProducts,
          avgOrderValue: paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0,
          pendingPayout: earningsRes.data?.summary?.totalPending || 0,
          avgRating: products.length
            ? (products.reduce((s, p) => s + (p.ratings || 0), 0) / products.length).toFixed(1)
            : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const STATUS_COLORS = {
    pending: { bg: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300', light: 'bg-yellow-50 dark:bg-yellow-900/30' },
    processing: { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', light: 'bg-blue-50 dark:bg-blue-900/30' },
    shipped: { bg: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300', light: 'bg-purple-50 dark:bg-purple-900/30' },
    delivered: { bg: 'bg-green-500', text: 'text-green-700 dark:text-green-300', light: 'bg-green-50 dark:bg-green-900/30' },
  };

  const STATUS_ORDER_COLORS = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    processing: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    shipped: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    delivered: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  };

  const totalStatusOrders = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's how your store is performing
          </p>
        </div>
        <button
          onClick={() => navigate('/seller/products/add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
        >
          <FiPlus size={16} />
          Add Product
        </button>
      </div>

      {/* Hero Revenue Card */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full" />
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-white opacity-5 rounded-full" />
        <div className="relative z-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-1">Total Revenue</p>
            <p className="text-4xl font-bold mb-2">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-1.5">
              {stats.revenueGrowth >= 0 ? (
                <FiTrendingUp size={14} className="text-green-300" />
              ) : (
                <FiTrendingDown size={14} className="text-red-300" />
              )}
              <span className={`text-sm font-medium ${stats.revenueGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
              </span>
              <span className="text-blue-200 text-sm">vs last month</span>
            </div>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-1">This Month</p>
              <p className="text-xl font-bold">₹{stats.thisMonthRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-1">Avg Order Value</p>
              <p className="text-xl font-bold">₹{stats.avgOrderValue}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-1">Pending Payout</p>
              <p className="text-xl font-bold">₹{stats.pendingPayout}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', link: '/seller/products' },
          { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingCart, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', link: '/seller/orders' },
          { label: 'Avg Rating', value: `${stats.avgRating} ⭐`, icon: FiStar, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30', link: '/seller/products' },
          { label: 'Pending Returns', value: stats.pendingReturns, icon: FiCornerUpLeft, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30', link: '/seller/returns' },
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.link)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Bulk Upload', icon: FiUpload, path: '/seller/bulk-upload', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { label: 'Flash Sale', icon: FiZap, path: '/seller/flash-sales', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
            { label: 'Coupons', icon: FiTag, path: '/seller/coupons', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            { label: 'Earnings', icon: FiDollarSign, path: '/seller/earnings', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                <action.icon size={17} className={action.color} />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(stats.outOfStock.length > 0 || stats.lowStock.length > 0) && (
        <div className="space-y-3 mb-6">
          {stats.outOfStock.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                  Out of Stock ({stats.outOfStock.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.outOfStock.slice(0, 8).map((p) => (
                  <span
                    key={p._id}
                    onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                    className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-red-200 dark:hover:bg-red-900 transition"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.lowStock.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle size={16} className="text-orange-600 dark:text-orange-400" />
                <p className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                  Low Stock Alert ({stats.lowStock.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.lowStock.map((p) => (
                  <span
                    key={p._id}
                    onClick={() => navigate(`/seller/products/edit/${p._id}`)}
                    className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900 transition"
                  >
                    {p.name} ({p.stock} left)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart + Order Status Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-800 dark:text-white">Sales Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('revenue')}
                className={`text-sm px-4 py-1.5 rounded-full border transition ${
                  chartType === 'revenue'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('orders')}
                className={`text-sm px-4 py-1.5 rounded-full border transition ${
                  chartType === 'orders'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {stats.chartData.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm">No data yet. Sales will appear here once orders come in.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              {chartType === 'revenue' ? (
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => [`₹${val}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorRev)" />
                </AreaChart>
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

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Order Status</h2>
          {totalStatusOrders === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => {
                const percent = totalStatusOrders ? Math.round((count / totalStatusOrders) * 100) : 0;
                const colors = STATUS_COLORS[status];
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${colors.light} ${colors.text}`}>
                        {status}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors.bg} transition-all`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">🏆 Top Products</h2>
          {stats.topProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No sales yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, i) => (
                <div key={p.name + i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  {p.image && (
                    <img src={p.image} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt={p.name} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.sold} sold</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600 flex-shrink-0">₹{p.revenue.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-white">Recent Orders</h2>
            <button
              onClick={() => navigate('/seller/orders')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <FiArrowRight size={11} />
            </button>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between gap-3 pb-3 border-b dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {order.buyer?.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      #{order._id.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-600">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_ORDER_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SellerDashboard;