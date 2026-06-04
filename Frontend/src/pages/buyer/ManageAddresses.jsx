import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { FiPlus, FiTrash2, FiMapPin, FiHome, FiBriefcase } from 'react-icons/fi';

const LABEL_ICONS = {
  Home: FiHome,
  Office: FiBriefcase,
  Other: FiMapPin,
};

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: 'Home',
    address: '',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await API.get('/auth/addresses');
      setAddresses(data);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) return toast.error('Please enter an address');
    setSaving(true);
    try {
      const { data } = await API.post('/auth/addresses', form);
      setAddresses(data);
      setShowForm(false);
      setForm({ label: 'Home', address: '', isDefault: false });
      toast.success('Address added!');
    } catch {
      toast.error('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Remove this address?')) return;
    try {
      const { data } = await API.delete(`/auth/addresses/${addressId}`);
      setAddresses(data);
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Saved Addresses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your delivery addresses for faster checkout
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <FiPlus size={16} />
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Add Address Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-blue-100 dark:border-blue-900">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiMapPin size={18} className="text-blue-600" />
            New Address
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">

            {/* Label Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address Type
              </label>
              <div className="flex gap-3">
                {['Home', 'Office', 'Other'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm({ ...form, label: l })}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition flex items-center justify-center gap-2 ${
                      form.label === l
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {l === 'Home' && <FiHome size={14} />}
                    {l === 'Office' && <FiBriefcase size={14} />}
                    {l === 'Other' && <FiMapPin size={14} />}
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                rows={3}
                placeholder="House/Flat No, Street, Area, City, State, PIN Code"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Default Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  form.isDefault
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                }`}>
                  {form.isDefault && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Set as default address
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ label: 'Home', address: '', isDefault: false });
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiPlus size={15} />
                    Save Address
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin size={28} className="text-blue-500" />
          </div>
          <p className="font-semibold text-gray-800 dark:text-white mb-1">
            No saved addresses
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Add an address to speed up your checkout
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const Icon = LABEL_ICONS[addr.label] || FiMapPin;
            return (
              <div
                key={addr._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex gap-4 items-start transition border-2 ${
                  addr.isDefault
                    ? 'border-blue-500 dark:border-blue-600'
                    : 'border-transparent'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  addr.isDefault
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <Icon
                    size={18}
                    className={addr.isDefault ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-800 dark:text-white text-sm">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                        ✓ Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {addr.address}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex-shrink-0"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            );
          })}

          {/* Add more hint */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-500 transition flex items-center justify-center gap-2"
          >
            <FiPlus size={16} />
            Add Another Address
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageAddresses;