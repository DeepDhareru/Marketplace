import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area,
} from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];

const StatCard = ({ label, value, sub, color = 'text-gray-800 dark:text-white', icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
    <div className="flex justify-between items-start mb-2">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {icon && <span className="text-2xl">{icon}</span>}
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/analytics');
        setData(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const { overview, monthlyData, dailyData, categorySales, topProducts, topSellers, newUsersData, orderStatusData } = data;

  const chartData = period === 'monthly' ? monthlyData : dailyData;
  const chartKey = period === 'monthly' ? 'month' : 'date';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Platform-wide performance overview
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${overview.totalRevenue.toLocaleString('en-IN')}`} sub={`₹${overview.last30Revenue.toLocaleString('en-IN')} last 30 days`} color="text-blue-600" icon="💰" />
        <StatCard label="Total Orders" value={overview.totalOrders} sub={`${overview.paidOrders} paid`} color="text-green-600" icon="🛒" />
        <StatCard label="Total Users" value={overview.totalUsers} sub={`${overview.totalSellers} sellers · ${overview.totalBuyers} buyers`} color="text-purple-600" icon="👥" />
        <StatCard label="Total Products" value={overview.totalProducts} sub={`${overview.totalReturns} return requests`} color="text-orange-600" icon="📦" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Last 7 Days Revenue" value={`₹${overview.last7Revenue.toLocaleString('en-IN')}`} color="text-blue-600" />
        <StatCard label="Avg Order Value" value={`₹${overview.paidOrders ? Math.round(overview.totalRevenue / overview.paidOrders) : 0}`} color="text-green-600" />
        <StatCard label="Active Sellers" value={overview.totalSellers} color="text-purple-600" />
        <StatCard label="Return Rate" value={`${overview.totalOrders ? ((overview.totalReturns / overview.totalOrders) * 100).toFixed(1) : 0}%`} color="text-red-600" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="font-semibold text-gray-800 dark:text-white">Revenue Over Time</h2>
          <div className="flex gap-2">
            {['monthly', 'daily'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                {p === 'monthly' ? 'Monthly' : 'Last 7 Days'}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-2">📊</p>
            <p>No data available yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={chartKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Category Sales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Sales by Category</h2>
          {categorySales.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="revenue"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categorySales.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {categorySales.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{c._id}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Order Status Breakdown</h2>
          {orderStatusData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize: 11 }} width={75} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]}>
                  {orderStatusData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry._id === 'delivered' ? '#16a34a' :
                        entry._id === 'pending' ? '#d97706' :
                        entry._id === 'cancelled' ? '#dc2626' :
                        entry._id === 'shipped' ? '#7c3aed' :
                        '#2563eb'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* New Users Chart */}
      {newUsersData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">New Users (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={newUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="users" name="New Users" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
            🏆 Top 5 Products by Revenue
          </h2>
          {topProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">No data</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  {p.image?.url && (
                    <img src={p.image.url} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt={p.name} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {p.totalSold} sold
                    </p>
                  </div>
                  <p className="text-sm font-bold text-blue-600 flex-shrink-0">
                    ₹{p.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Sellers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
            🏪 Top 5 Sellers by Revenue
          </h2>
          {topSellers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">No data</div>
          ) : (
            <div className="space-y-3">
              {topSellers.map((s, i) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm flex-shrink-0">
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.totalOrders} orders
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600 flex-shrink-0">
                    ₹{s.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;