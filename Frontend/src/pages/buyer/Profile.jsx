import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiLock,
  FiShoppingBag, FiHeart, FiStar, FiEdit2,
  FiCheck, FiX, FiCamera
} from 'react-icons/fi';

const Profile = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, reviews: 0 });
  const [editingField, setEditingField] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          API.get('/orders/my').catch(() => ({ data: [] })),
          API.get('/wishlist').catch(() => ({ data: { products: [] } })),
        ]);
        setStats({
          orders: ordersRes.data.length,
          wishlist: wishlistRes.data.products?.length || 0,
          reviews: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleFieldSave = async (field) => {
    setLoading(true);
    try {
      const { data } = await API.put('/auth/profile', { [field]: form[field] });
      login({ ...user, [field]: form[field], name: data.name || user.name });
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`);
      setEditingField(null);
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await API.put('/auth/profile', { password: passwordForm.password });
      toast.success('Password changed successfully!');
      setPasswordForm({ password: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'activity', label: 'Activity', icon: FiShoppingBag },
  ];

  const avatarColor = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-orange-400 to-orange-600',
    'from-pink-400 to-pink-600',
  ][user?.name?.charCodeAt(0) % 5 || 0];

  const ROLE_BADGE = {
    buyer: { label: 'Buyer', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
    seller: { label: 'Seller', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
    admin: { label: 'Admin', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  };

  const EditableField = ({ field, label, icon: Icon, placeholder, type = 'text' }) => {
    const isEditing = editingField === field;
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              {isEditing ? (
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full bg-white dark:bg-gray-600 border border-blue-300 dark:border-blue-500 rounded-lg px-3 py-1.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {form[field] || (
                    <span className="text-gray-400 dark:text-gray-500 font-normal">
                      Not set — click edit to add
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Edit / Save / Cancel buttons */}
          <div className="flex items-center gap-1 ml-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleFieldSave(field)}
                  disabled={loading}
                  className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition"
                >
                  <FiCheck size={14} className="text-white" />
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 flex items-center justify-center transition"
                >
                  <FiX size={14} className="text-gray-700 dark:text-gray-300" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditingField(field)}
                className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 hover:border-blue-400 flex items-center justify-center transition"
              >
                <FiEdit2 size={13} className="text-gray-500 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden mb-6">

        {/* Cover */}
        <div className={`h-28 bg-gradient-to-r ${avatarColor} relative`}>
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
        </div>

        {/* Avatar + Info */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-end -mt-10 mb-4 flex-wrap gap-3">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-gray-800`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ROLE_BADGE[user?.role]?.color}`}>
                {ROLE_BADGE[user?.role]?.label}
              </span>
              {user?.isVerified && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
              month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="border-t dark:border-gray-700 grid grid-cols-3 divide-x dark:divide-gray-700">
          {[
            { label: 'Orders', value: statsLoading ? '...' : stats.orders, icon: FiShoppingBag, color: 'text-blue-600' },
            { label: 'Wishlist', value: statsLoading ? '...' : stats.wishlist, icon: FiHeart, color: 'text-red-500' },
            { label: 'Reviews', value: statsLoading ? '...' : stats.reviews, icon: FiStar, color: 'text-yellow-500' },
          ].map((stat) => (
            <div key={stat.label} className="py-4 flex flex-col items-center gap-1">
              <stat.icon size={16} className={stat.color} />
              <p className="text-xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-3">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">
            Personal Information
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-2">
              Click edit icon to update each field
            </span>
          </h2>

          <EditableField
            field="name"
            label="Full Name"
            icon={FiUser}
            placeholder="Enter your full name"
          />
          <EditableField
            field="phone"
            label="Phone Number"
            icon={FiPhone}
            placeholder="Enter your phone number"
            type="tel"
          />
          <EditableField
            field="address"
            label="Default Address"
            icon={FiMapPin}
            placeholder="Enter your address"
          />

          {/* Email (non-editable) */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <FiMail size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.email}</p>
              </div>
              <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                Cannot change
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">

          {/* Password Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Keep your account secure with a strong password
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {showPasswordForm ? 'Cancel' : 'Change'}
              </button>
            </div>

            {!showPasswordForm ? (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <FiLock size={16} className="text-gray-500 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">••••••••••••</p>
                <span className="ml-auto text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  Protected
                </span>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Re-enter new password"
                  />
                </div>

                {/* Password strength indicator */}
                {passwordForm.password && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            passwordForm.password.length >= level * 2
                              ? level <= 1 ? 'bg-red-400'
                                : level <= 2 ? 'bg-orange-400'
                                : level <= 3 ? 'bg-yellow-400'
                                : 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {passwordForm.password.length < 4 ? 'Too weak'
                        : passwordForm.password.length < 6 ? 'Weak'
                        : passwordForm.password.length < 8 ? 'Good'
                        : 'Strong'} password
                    </p>
                  </div>
                )}

                {/* Match indicator */}
                {passwordForm.confirmPassword && (
                  <p className={`text-xs font-medium ${
                    passwordForm.password === passwordForm.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}>
                    {passwordForm.password === passwordForm.confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              {[
                { label: 'Account ID', value: user?._id, mono: true },
                { label: 'Role', value: ROLE_BADGE[user?.role]?.label },
                { label: 'Account Status', value: 'Active' },
                { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                  <span className={`text-sm font-medium text-gray-800 dark:text-white ${item.mono ? 'font-mono text-xs' : ''}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'My Orders', icon: FiShoppingBag, link: '/my-orders', color: 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300', count: stats.orders },
                { label: 'Wishlist', icon: FiHeart, link: '/wishlist', color: 'bg-red-50 dark:bg-red-900 text-red-500 dark:text-red-300', count: stats.wishlist },
                { label: 'Addresses', icon: FiMapPin, link: '/addresses', color: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300', count: null },
                { label: 'Reviews', icon: FiStar, link: '/', color: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300', count: stats.reviews },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.link}
                  className={`${item.color} rounded-xl p-4 flex flex-col gap-2 hover:opacity-80 transition`}
                >
                  <div className="flex justify-between items-start">
                    <item.icon size={20} />
                    {item.count !== null && (
                      <span className="text-xs font-bold bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                        {statsLoading ? '...' : item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold">{item.label}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Account Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {[user?.name, user?.phone, user?.address].filter(Boolean).length * 33}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${[user?.name, user?.phone, user?.address].filter(Boolean).length * 33}%` }}
                />
              </div>
              {!user?.phone && (
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  💡 Add your phone number to complete your profile
                </p>
              )}
              {!user?.address && (
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  💡 Add your address for faster checkout
                </p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Profile;