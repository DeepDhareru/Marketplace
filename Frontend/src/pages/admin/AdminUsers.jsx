import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800">{user.name}</td>
                <td className="px-6 py-3 text-gray-500">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => toggleStatus(user._id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                        user.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {user.isActive ? 'Ban' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;