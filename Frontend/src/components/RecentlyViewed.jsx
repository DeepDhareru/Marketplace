import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import StarRating from './StarRating';

const RecentlyViewed = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const ids = stored.filter((id) => id !== currentProductId).slice(0, 4);

    const fetchProducts = async () => {
      try {
        const results = await Promise.all(
          ids.map((id) => API.get(`/products/${id}`))
        );
        setProducts(results.map((r) => r.data));
      } catch {
        setProducts([]);
      }
    };

    if (ids.length > 0) fetchProducts();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition overflow-hidden cursor-pointer"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            <img
              src={product.images?.[0]?.url || 'https://via.placeholder.com/200'}
              alt={product.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                {product.name}
              </p>
              <StarRating rating={product.ratings} />
              <p className="text-blue-600 font-bold text-sm mt-1">₹{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;