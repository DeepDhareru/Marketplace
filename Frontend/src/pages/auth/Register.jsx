import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer', referralCode: searchParams.get('ref') || '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    if (!form.email.trim()) return toast.error('Please enter your email');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      toast.success('Account created! Check your email for OTP.');
      // Redirect to verify page instead of logging in
      navigate('/verify-email', {
        state: { userId: data.userId, email: data.email }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const strengthLevel = () => {
    const len = form.password.length;
    if (len === 0) return null;
    if (len < 4) return { label: 'Too weak', color: 'bg-red-400', width: '25%', text: 'text-red-500' };
    if (len < 6) return { label: 'Weak', color: 'bg-orange-400', width: '50%', text: 'text-orange-500' };
    if (len < 8) return { label: 'Good', color: 'bg-yellow-400', width: '75%', text: 'text-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-500' };
  };

  const strength = strengthLevel();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🛒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Join Marketplace for free today
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`text-xs font-medium ${step === 1 ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
              Your Details
            </span>
          </div>
          <div className={`flex-1 h-px ${step > 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className={`text-xs font-medium ${step === 2 ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
              Choose Role
            </span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>

                {/* Password Strength */}
                {strength && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${strength.text}`}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Referral Code
                  <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🎁</span>
                  <input
                    type="text"
                    name="referralCode"
                    value={form.referralCode}
                    onChange={handleChange}
                    placeholder="Enter referral code"
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400 dark:bg-gray-700 dark:text-white ${
                      form.referralCode
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  />
                  {form.referralCode && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                  )}
                </div>
                {form.referralCode && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    🎉 You'll get ₹30 credits on signup!
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                Continue
                <FiArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                How will you use Marketplace?
              </p>

              {/* Buyer Card */}
              <div
                onClick={() => setForm({ ...form, role: 'buyer' })}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  form.role === 'buyer'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛍️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      I want to Buy
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Browse and purchase products
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form.role === 'buyer'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {form.role === 'buyer' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Seller Card */}
              <div
                onClick={() => setForm({ ...form, role: 'seller' })}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  form.role === 'seller'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏪</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      I want to Sell
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      List products and manage your store
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    form.role === 'seller'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {form.role === 'seller' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium"
                >
                  <FiArrowLeft size={14} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <FiArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;