import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const items = state?.items || [];
  const total = state?.total || 0;
  const finalTotal = total - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setCouponLoading(true);
    try {
      const { data } = await API.post('/coupons/validate', {
        code: couponCode,
        orderAmount: total,
      });
      setDiscount(data.discount);
      setCouponApplied(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setCouponApplied(false);
    toast.success('Coupon removed');
  };

  const handlePayment = async () => {
    if (!address.trim()) return toast.error('Please enter shipping address');
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { data } = await API.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        shippingAddress: address,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: finalTotal * 100,
        currency: 'INR',
        name: 'Marketplace',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await API.post('/orders/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful! 🎉');
            fetchCartCount();
            navigate('/my-orders');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: 'Buyer', email: 'buyer@example.com' },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img
                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}
                className="w-12 h-12 object-cover rounded-lg"
                alt={item.product?.name}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">{item.product?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                ₹{item.product?.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t dark:border-gray-700 pt-3 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Coupon Discount</span>
              <span>- ₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-800 dark:text-white text-lg border-t dark:border-gray-700 pt-2">
            <span>Total</span>
            <span className="text-blue-600">₹{finalTotal}</span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-3">Have a Coupon?</h2>
        {!couponApplied ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg px-4 py-3">
            <div>
              <p className="font-mono font-bold text-green-700 dark:text-green-300">{couponCode}</p>
              <p className="text-sm text-green-600 dark:text-green-400">You save ₹{discount}!</p>
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Shipping Address */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Shipping Address</h2>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          placeholder="Enter your full shipping address..."
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
        />

        {/* Price Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Items ({items.length})</span>
            <span>₹{total}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Coupon ({couponCode})</span>
              <span>- ₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 dark:text-white border-t dark:border-gray-600 pt-2 mt-1">
            <span>Total Payable</span>
            <span className="text-blue-600 text-lg">₹{finalTotal}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg"
        >
          {loading ? 'Processing...' : `Pay ₹${finalTotal} with Razorpay`}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
          🔒 Secured by Razorpay. Your payment info is safe.
        </p>
      </div>
    </div>
  );
};

export default Checkout;