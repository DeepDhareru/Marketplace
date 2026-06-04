import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';
import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCompare } = useCompare();

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    setAddingToCart(true);
    await addToCart(product._id);
    setAddingToCart(false);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
      onClick={() => navigate(`/product/${product._id}`)}
    >

      {/* Image Container */}
      <div className="relative bg-gray-100 dark:bg-gray-700">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className={`w-full h-52 object-cover rounded-t-2xl ${
            isOutOfStock ? 'opacity-50 grayscale' : ''
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />

        {/* Top Left Badge */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            Out of Stock
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-medium animate-pulse">
            Only {product.stock} left!
          </div>
        )}

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Wishlist */}
          <button
            onClick={toggleWishlist}
            className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
          >
            <FiHeart
              size={15}
              className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}
            />
          </button>

          {/* Quick view */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
            className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
          >
            <FiEye size={15} className="text-gray-500 dark:text-gray-300" />
          </button>
        </div>

        {/* Category pill */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white dark:bg-gray-800 bg-opacity-90 text-xs text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">

        {/* Verified Badge */}
        {product.seller?.isVerified && (
          <div className="mb-2">
            <VerifiedBadge size="sm" />
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.ratings} />
          {product.numReviews > 0 ? (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({product.numReviews})
            </span>
          ) : (
            <span className="text-xs text-gray-300 dark:text-gray-600">No reviews</span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price Row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </p>
            )}
          </div>
          {!isOutOfStock && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            isOutOfStock
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {addingToCart ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : isOutOfStock ? (
            'Out of Stock'
          ) : (
            <>
              <FiShoppingCart size={15} />
              Add to Cart
            </>
          )}
        </button>

        {/* Compare Button */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
          className="w-full mt-2 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-1.5"
        >
          ⚖️ Compare
        </button>

      </div>
    </div>
  );
};

export default ProductCard;