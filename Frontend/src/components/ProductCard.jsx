import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';
import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiHeart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to add to wishlist');
    try {
      const { data } = await API.post('/wishlist/toggle', { productId: product._id });
      setWishlisted(data.wishlisted);
      toast.success(data.message);
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition overflow-hidden relative">

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow"
      >
        <FiHeart
          size={18}
          className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}
        />
      </button>

      {/* Out of Stock Badge */}
      {product.stock === 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Out of Stock
        </div>
      )}

      {/* Low Stock Badge */}
      {product.stock > 0 && product.stock <= 5 && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
          Only {product.stock} left!
        </div>
      )}

      {/* Product Image */}
      <img
        src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        className={`w-full h-48 object-cover cursor-pointer ${
          product.stock === 0 ? 'opacity-60' : ''
        }`}
        onClick={() => navigate(`/product/${product._id}`)}
      />

      <div className="p-4">

        {/* Product Name */}
        <h3
          className="font-semibold text-gray-800 dark:text-white truncate cursor-pointer hover:text-blue-600 transition"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>

        {/* Category */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>

        {/* Verified Badge */}
        {product.seller?.isVerified && (
          <div className="mb-1">
            <VerifiedBadge size="sm" />
          </div>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={product.ratings} />
          {product.numReviews > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({product.numReviews})
            </span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
          <button
            onClick={() => addToCart(product._id)}
            disabled={product.stock === 0}
            className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${
              product.stock === 0
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;