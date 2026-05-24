import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [flashPrices, setFlashPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/cart');
      setCart(data);

      // Check flash sales for each item
      const salesRes = await API.get('/flash-sales/active');
      const activeSales = salesRes.data;
      const priceMap = {};
      data.items?.forEach((item) => {
        const sale = activeSales.find(
          (s) => s.product?._id === item.product?._id
        );
        if (sale) {
          priceMap[item.product?._id] = {
            salePrice: sale.salePrice,
            originalPrice: sale.originalPrice,
            discountPercent: sale.discountPercent,
          };
        }
      });
      setFlashPrices(priceMap);
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (productId) => {
    try {
      await API.delete(`/cart/${productId}`);
      toast.success('Item removed');
      fetchCart();
      fetchCartCount();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await API.delete('/cart/clear');
      toast.success('Cart cleared');
      fetchCart();
      fetchCartCount();
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) return <Loader />;

  const items = cart?.items || [];

  // Calculate total with flash sale prices
  const total = items.reduce((sum, item) => {
    const flash = flashPrices[item.product?._id];
    const price = flash ? flash.salePrice : item.product?.price;
    return sum + price * item.quantity;
  }, 0);

  const originalTotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
  );

  const totalSavings = originalTotal - total;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => {
              const flash = flashPrices[item.product?._id];
              const effectivePrice = flash ? flash.salePrice : item.product?.price;

              return (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex gap-4 items-center">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className={`font-bold ${flash ? 'text-red-600' : 'text-blue-600'}`}>
                        ₹{effectivePrice * item.quantity}
                      </p>
                      {flash && (
                        <>
                          <p className="text-sm text-gray-400 dark:text-gray-500 line-through">
                            ₹{item.product?.price * item.quantity}
                          </p>
                          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                            ⚡ -{flash.discountPercent}% Flash Sale
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product?._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 flex items-center gap-2">
                <span className="text-green-600 text-lg">🎉</span>
                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                  You're saving ₹{totalSavings} with flash sale prices!
                </p>
              </div>
            )}

            <div className="space-y-2 mb-4">
              {totalSavings > 0 && (
                <>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Original Total</span>
                    <span className="line-through">₹{originalTotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Flash Sale Discount</span>
                    <span>- ₹{totalSavings}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center border-t dark:border-gray-700 pt-3">
                <span className="text-lg font-semibold text-gray-800 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-blue-600">₹{total}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 border border-red-400 text-red-500 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/checkout', {
                  state: { items, total, flashPrices }
                })}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;