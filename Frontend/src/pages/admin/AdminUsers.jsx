import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import VerifiedBadge from '../../components/VerifiedBadge';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/admin/users');
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleStatus = async (id) => {
    try {
      await API.put(`/admin/users/${id}/toggle`);
      setUsers(users.map((u) =>
        u._id === id ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const toggleVerify = async (id) => {
    try {
      await API.put(`/admin/users/${id}/verify`);
      setUsers(users.map((u) =>
        u._id === id ? { ...u, isVerified: !u.isVerified } : u
      ));
      toast.success('Verification status updated');
    } catch {
      toast.error('Failed to update verification');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Manage Users
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-blue-50 dark:bg-blue-900 text-blue-600', icon: '👥' },
          { label: 'Buyers', value: users.filter((u) => u.role === 'buyer').length, color: 'bg-green-50 dark:bg-green-900 text-green-600', icon: '🛍️' },
          { label: 'Sellers', value: users.filter((u) => u.role === 'seller').length, color: 'bg-purple-50 dark:bg-purple-900 text-purple-600', icon: '🏪' },
          { label: 'Verified Sellers', value: users.filter((u) => u.isVerified).length, color: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600', icon: '✓' },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl p-4 ${card.color} bg-opacity-40`}>
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Verified</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 dark:text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    {/* Name */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : user.role === 'seller'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>

                    {/* Verified */}
                    <td className="px-6 py-3">
                      {user.role === 'seller' ? (
                        user.isVerified
                          ? <VerifiedBadge />
                          : <span className="text-xs text-gray-400 dark:text-gray-500">Not verified</span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3">
                      {user.role !== 'admin' ? (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => toggleStatus(user._id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                              user.isActive
                                ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-100'
                                : 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-100'
                            }`}
                          >
                            {user.isActive ? 'Ban' : 'Activate'}
                          </button>

                          {user.role === 'seller' && (
                            <button
                              onClick={() => toggleVerify(user._id)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                                user.isVerified
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                  : 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-100'
                              }`}
                            >
                              {user.isVerified ? 'Unverify' : '✓ Verify'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
};

export default AdminUsers;