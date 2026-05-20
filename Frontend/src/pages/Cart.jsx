import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchCartCount } = useCart();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const { data } = await API.get('/cart');
      setCart(data);
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
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
                <img
                  src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  <p className="text-blue-600 font-bold">₹{item.product?.price * item.quantity}</p>
                </div>
                <button
                  onClick={() => removeItem(item.product?._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{total}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 border border-red-400 text-red-500 py-2.5 rounded-lg hover:bg-red-50 transition"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/checkout', { state: { items, total } })}
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