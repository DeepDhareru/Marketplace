import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

const ProductRecommendations = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/products', { params: { category } });
        const filtered = data
          .filter((p) => p._id !== currentProductId)
          .slice(0, 4);
        setProducts(filtered);
      } catch {
        setProducts([]);
      }
    };
    if (category) fetch();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        You May Also Like
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition overflow-hidden"
          >
            <img
              src={product.images?.[0]?.url || 'https://via.placeholder.com/200'}
              alt={product.name}
              className="w-full h-36 object-cover cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            />
            <div className="p-3">
              <p
                className="font-medium text-gray-800 dark:text-white text-sm truncate cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {product.name}
              </p>
              <StarRating rating={product.ratings} />
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600 font-bold text-sm">₹{product.price}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;