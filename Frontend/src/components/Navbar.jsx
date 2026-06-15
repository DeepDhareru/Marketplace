import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState, useRef } from 'react';
import {
  FiShoppingCart, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiMessageCircle, FiChevronDown,
  FiHeart, FiMapPin, FiCornerUpLeft, FiZap, FiGitMerge, FiGift,
  FiGrid, FiPackage, FiTag, FiDollarSign, FiUpload,
  FiBarChart2, FiUsers, FiShield,
} from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, fetchCartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadChats, setUnreadChats] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await API.get('/chat/unread');
        setUnreadChats(data.count);
      } catch {
        setUnreadChats(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Menu definitions ─────────────────────────────────────
  const buyerMenuItems = [
    { icon: FiShoppingCart, label: 'My Orders', path: '/my-orders', emoji: '📦' },
    { icon: FiHeart, label: 'Wishlist', path: '/wishlist', emoji: '❤️' },
    { icon: FiMapPin, label: 'Addresses', path: '/addresses', emoji: '📍' },
    { icon: FiZap, label: 'Flash Deals', path: '/flash-sales', emoji: '⚡' },
    { icon: FiGitMerge, label: 'Compare', path: '/compare', emoji: '⚖️' },
    { icon: FiGift, label: 'Referral', path: '/referral', emoji: '🎁' },
    { icon: FiCornerUpLeft, label: 'My Returns', path: '/my-returns', emoji: '↩️' },
  ];

  const sellerMenuItems = [
    { icon: FiGrid, label: 'Dashboard', path: '/seller/dashboard', emoji: '📊' },
    { icon: FiPackage, label: 'My Products', path: '/seller/products', emoji: '📦' },
    { icon: FiShoppingCart, label: 'Orders', path: '/seller/orders', emoji: '🛒' },
    { icon: FiTag, label: 'Coupons', path: '/seller/coupons', emoji: '🎟️' },
    { icon: FiZap, label: 'Flash Sales', path: '/seller/flash-sales', emoji: '⚡' },
    { icon: FiCornerUpLeft, label: 'Returns', path: '/seller/returns', emoji: '↩️' },
    { icon: FiUpload, label: 'Bulk Upload', path: '/seller/bulk-upload', emoji: '📤' },
    { icon: FiDollarSign, label: 'Earnings', path: '/seller/earnings', emoji: '💰' },
  ];

  const adminMenuItems = [
    { icon: FiGrid, label: 'Dashboard', path: '/admin/dashboard', emoji: '📊' },
    { icon: FiUsers, label: 'Users', path: '/admin/users', emoji: '👥' },
    { icon: FiPackage, label: 'Products', path: '/admin/products', emoji: '📦' },
    { icon: FiShoppingCart, label: 'Orders', path: '/admin/orders', emoji: '🛒' },
    { icon: FiBarChart2, label: 'Analytics', path: '/admin/analytics', emoji: '📈' },
  ];

  const menuItems =
    user?.role === 'buyer' ? buyerMenuItems :
    user?.role === 'seller' ? sellerMenuItems :
    user?.role === 'admin' ? adminMenuItems : [];

  const menuLabel =
    user?.role === 'buyer' ? 'Menu' :
    user?.role === 'seller' ? 'Seller Panel' :
    user?.role === 'admin' ? 'Admin Panel' : '';

  const menuColor =
    user?.role === 'seller' ? {
      active: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
      hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600',
      dot: 'bg-purple-500',
    } :
    user?.role === 'admin' ? {
      active: 'bg-red-50 dark:bg-red-900/30 text-red-600',
      hover: 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600',
      dot: 'bg-red-500',
    } : {
      active: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
      hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600',
      dot: 'bg-blue-500',
    };

  const isActiveMenu = menuItems.some((item) =>
    location.pathname.startsWith(item.path)
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-blue-600 flex items-center gap-2 flex-shrink-0"
        >
          🛒 <span>Marketplace</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode
              ? <FiSun size={18} className="text-yellow-400" />
              : <FiMoon size={18} className="text-gray-500" />
            }
          </button>

          {/* Guest */}
          {!user ? (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-3 py-2 rounded-xl transition">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* ── Unified Dropdown ──────────────────── */}
              {menuItems.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition ${
                      dropdownOpen || isActiveMenu
                        ? menuColor.active
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {/* Role indicator dot */}
                    <span className={`w-1.5 h-1.5 rounded-full ${menuColor.dot}`} />
                    {menuLabel}
                    <FiChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Panel */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden">

                      {/* Role header */}
                      <div className="px-4 py-2 border-b dark:border-gray-700 mb-1">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                          {user.role === 'seller' ? '🏪 Seller Panel' :
                           user.role === 'admin' ? '🛡️ Admin Panel' :
                           '👤 My Account'}
                        </p>
                      </div>

                      {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                          location.pathname.startsWith(item.path + '/');
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                              isActive
                                ? `${menuColor.active} font-medium`
                                : `text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600`
                            }`}
                          >
                            <span className="text-base">{item.emoji}</span>
                            {item.label}
                            {isActive && (
                              <span className={`ml-auto w-1.5 h-1.5 rounded-full ${menuColor.dot}`} />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Cart — buyer only */}
              {user.role === 'buyer' && (
                <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <FiShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Chat */}
              <Link to="/chat" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <FiMessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadChats > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                    {unreadChats > 9 ? '9+' : unreadChats}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <NotificationBell />

              {/* Avatar */}
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition flex-shrink-0"
                title="Profile"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title="Logout"
              >
                <FiLogOut size={18} className="text-red-500" />
              </button>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-1.5">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {darkMode ? <FiSun size={17} className="text-yellow-400" /> : <FiMoon size={17} className="text-gray-500" />}
          </button>
          {user && (
            <>
              {user.role === 'buyer' && (
                <Link to="/cart" className="relative p-1.5">
                  <FiShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}
              <Link to="/chat" className="relative p-1.5">
                <FiMessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadChats > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {unreadChats > 9 ? '9+' : unreadChats}
                  </span>
                )}
              </Link>
              <NotificationBell />
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {mobileOpen
              ? <FiX size={20} className="text-gray-700 dark:text-gray-300" />
              : <FiMenu size={20} className="text-gray-700 dark:text-gray-300" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4">
          {!user ? (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="block text-center border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                className="block text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Get Started Free
              </Link>
            </div>
          ) : (
            <div className="space-y-1">

              {/* Role label */}
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 pt-1 pb-2">
                {user.role === 'seller' ? '🏪 Seller Panel' :
                 user.role === 'admin' ? '🛡️ Admin Panel' :
                 '👤 My Account'}
              </p>

              {/* Menu items */}
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm ${
                      isActive
                        ? `${menuColor.active} font-medium`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{item.emoji}</span>
                      {item.label}
                    </span>
                    {isActive && <span className={`w-1.5 h-1.5 rounded-full ${menuColor.dot}`} />}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t dark:border-gray-700 my-2" />

              {/* Profile & Logout */}
              <div className="flex items-center justify-between px-1 pt-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;