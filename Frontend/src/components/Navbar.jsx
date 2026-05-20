import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';
import { FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, fetchCartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">🛒 Marketplace</Link>

        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode
              ? <FiSun size={20} className="text-yellow-400" />
              : <FiMoon size={20} className="text-gray-600" />
            }
          </button>

          {!user ? (
            <>
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'buyer' && (
                <>
                  <Link to="/my-orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">My Orders</Link>
                  <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Wishlist</Link>
                  <Link to="/cart" className="relative">
                    <FiShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user.role === 'seller' && (
                <>
                  <Link to="/seller/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Dashboard</Link>
                  <Link to="/seller/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Products</Link>
                  <Link to="/seller/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Orders</Link>
                  <Link to="/seller/coupons" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Coupons</Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Dashboard</Link>
                  <Link to="/admin/users" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Users</Link>
                  <Link to="/admin/products" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Products</Link>
                  <Link to="/admin/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 text-sm">Orders</Link>
                </>
              )}

              <Link to="/profile"><FiUser size={20} className="text-gray-700 dark:text-gray-300" /></Link>
              <button onClick={handleLogout}><FiLogOut size={20} className="text-red-500" /></button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;