import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  if (error || !stats) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-5xl mb-4">⚠️</p>
      <p>Failed to load dashboard. Make sure backend is running.</p>
    </div>
  );

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'text-green-600 bg-green-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '🛒', color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: '💰', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-6 ${card.color} bg-opacity-30`}>
            <p className="text-3xl mb-2">{card.icon}</p>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          📊 View Full Analytics
        </Link>
      </div>
    </div>
    
  );
};

export default AdminDashboard;