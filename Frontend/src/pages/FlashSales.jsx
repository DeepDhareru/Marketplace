import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

const FlashSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/flash-sales/active');
        setSales(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg flex items-center gap-2">
          ⚡ Flash Sales
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Limited time offers — grab them before they're gone!
        </p>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-5xl mb-4">⚡</p>
          <p className="text-lg font-medium mb-2">No active flash sales</p>
          <p className="text-sm">Check back later for amazing deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => (
            <div key={sale._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border border-red-100 dark:border-red-900"
            >
              {/* Sale Badge */}
              <div className="relative">
                <img
                  src={sale.product?.images?.[0]?.url || 'https://via.placeholder.com/300'}
                  alt={sale.product?.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${sale.product?._id}`)}
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{sale.discountPercent}% OFF
                </div>
              </div>

              <div className="p-4">
                <h3
                  className="font-semibold text-gray-800 dark:text-white truncate cursor-pointer hover:text-red-600 transition mb-1"
                  onClick={() => navigate(`/product/${sale.product?._id}`)}
                >
                  {sale.product?.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-red-600">₹{sale.salePrice}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                    ₹{sale.originalPrice}
                  </span>
                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                    Save ₹{sale.originalPrice - sale.salePrice}
                  </span>
                </div>

                {/* Timer */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ends in:</p>
                  <FlashSaleTimer endTime={sale.endTime} />
                </div>

                <button
                  onClick={() => addToCart(sale.product?._id)}
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashSales;