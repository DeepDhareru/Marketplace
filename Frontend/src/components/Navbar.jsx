import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState, useRef } from 'react';
import {
  FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiMessageCircle, FiChevronDown,
  FiHeart, FiMapPin, FiRefreshCw, FiCornerUpLeft, FiZap, FiGitMerge, FiGift
} from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, fetchCartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  // Buyer dropdown menu items
  const buyerMenuItems = [
    { icon: FiShoppingCart, label: 'My Orders', path: '/my-orders' },
    { icon: FiHeart, label: 'Wishlist', path: '/wishlist' },
    { icon: FiMapPin, label: 'Addresses', path: '/addresses' },
    { icon: FiZap, label: 'Flash Deals', path: '/flash-sales' },
    { icon: FiGitMerge, label: 'Compare', path: '/compare' },
    { icon: FiGift, label: 'Referral', path: '/referral' },
    { icon: FiCornerUpLeft, label: 'My Returns', path: '/my-returns' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-blue-600 flex items-center gap-2 flex-shrink-0"
          onClick={closeMenu}
        >
          🛒 <span>Marketplace</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">

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
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* ── BUYER ─────────────────────────────── */}
              {user.role === 'buyer' && (
                <>
                  {/* More dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition ${
                        dropdownOpen
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      Menu
                      <FiChevronDown
                        size={14}
                        className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 top-11 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                        {buyerMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <item.icon size={15} className="flex-shrink-0" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart */}
                  <Link to="/cart" className="relative p-2">
                    <FiShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Chat */}
                  <Link to="/chat" className="relative p-2">
                    <FiMessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
                    {unreadChats > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadChats > 9 ? '9+' : unreadChats}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* ── SELLER ────────────────────────────── */}
              {user.role === 'seller' && (
                <>
                  <Link to="/seller/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Dashboard
                  </Link>
                  <Link to="/seller/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Products
                  </Link>
                  <Link to="/seller/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Orders
                  </Link>
                  <Link to="/seller/coupons" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Coupons
                  </Link>
                  <Link to="/seller/flash-sales" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Flash Sales
                  </Link>
                  <Link to="/seller/returns" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Returns
                  </Link>

                  {/* Chat for seller */}
                  <Link to="/chat" className="relative p-2">
                    <FiMessageCircle size={20} className="text-gray-600 dark:text-gray-300" />
                    {unreadChats > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadChats > 9 ? '9+' : unreadChats}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* ── ADMIN ─────────────────────────────── */}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Users
                  </Link>
                  <Link to="/admin/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Products
                  </Link>
                  <Link to="/admin/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Orders
                  </Link>
                </>
              )}

              {/* ── Common icons ──────────────────────── */}
              <NotificationBell />
              
              {/* Profile dropdown */}
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition flex-shrink-0"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title="Logout"
              >
                <FiLogOut size={18} className="text-red-500" />
              </button>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode
              ? <FiSun size={17} className="text-yellow-400" />
              : <FiMoon size={17} className="text-gray-500" />
            }
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
              <Link to="/login" onClick={closeMenu}
                className="block text-center border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}
                className="block text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Get Started Free
              </Link>
            </div>
          ) : (
            <div className="space-y-1">

              {/* Buyer mobile links */}
              {user.role === 'buyer' && (
                <>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 pt-2 pb-1">
                    My Account
                  </p>
                  {[
                    { icon: '📦', label: 'My Orders', path: '/my-orders' },
                    { icon: '❤️', label: 'Wishlist', path: '/wishlist' },
                    { icon: '📍', label: 'Addresses', path: '/addresses' },
                    { icon: '🛒', label: 'Cart', path: '/cart', badge: cartCount },
                    { icon: '⚡', label: 'Flash Deals', path: '/flash-sales' },
                    { icon: '⚖️', label: 'Compare', path: '/compare' },
                    { icon: '🎁', label: 'Referral', path: '/referral' },
                    { icon: '💬', label: 'Messages', path: '/chat', badge: unreadChats },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition text-sm"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{item.icon}</span>
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </>
              )}

              {/* Seller mobile links */}
              {user.role === 'seller' && (
                <>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 pt-2 pb-1">
                    Seller Panel
                  </p>
                  {[
                    { icon: '📊', label: 'Dashboard', path: '/seller/dashboard' },
                    { icon: '📦', label: 'Products', path: '/seller/products' },
                    { icon: '🛒', label: 'Orders', path: '/seller/orders' },
                    { icon: '🎟️', label: 'Coupons', path: '/seller/coupons' },
                    { icon: '⚡', label: 'Flash Sales', path: '/seller/flash-sales' },
                    { icon: '💬', label: 'Messages', path: '/chat', badge: unreadChats },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition text-sm"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>{item.icon}</span>
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </>
              )}

              {/* Admin mobile links */}
              {user.role === 'admin' && (
                <>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 pt-2 pb-1">
                    Admin Panel
                  </p>
                  {[
                    { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: '👥', label: 'Users', path: '/admin/users' },
                    { icon: '📦', label: 'Products', path: '/admin/products' },
                    { icon: '🛒', label: 'Orders', path: '/admin/orders' },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 transition text-sm"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </>
              )}

              {/* Profile & Logout */}
              <div className="border-t dark:border-gray-700 mt-3 pt-3 flex items-center justify-between px-1">
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
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