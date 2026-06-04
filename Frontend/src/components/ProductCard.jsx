import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
import VerifiedBadge from './VerifiedBadge';
import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useCompare } from '../context/CompareContext';

const getOptimizedUrl = (url) => {
  if (!url) return null;
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/f_jpg,q_auto,w_400/');
  }
  return url;
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imgError, setImgError] = useState(false);
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
  const imageUrl = getOptimizedUrl(product.images?.[0]?.url);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col border border-gray-100 dark:border-gray-700">

      {/* Image */}
      <div
        className="relative cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
        style={{ height: '200px' }}
      >
        {/* Badges */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 z-10 bg-gray-800 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            Out of Stock
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-medium">
            Only {product.stock} left!
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(e); }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        >
          <FiHeart
            size={15}
            className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}
          />
        </button>

        {/* Image */}
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '16px 16px 0 0',
              opacity: isOutOfStock ? 0.5 : 1,
              display: 'block',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '200px',
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '40px' }}>🖼️</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>No Image</span>
          </div>
        )}

        {/* Category pill on image */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-white dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium shadow-sm border border-gray-100 dark:border-gray-700">
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

        {/* Name */}
        <h3
          className="font-semibold text-gray-800 dark:text-white text-sm leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(`/product/${product._id}`)}
          style={{ minHeight: '40px' }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.ratings} />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {product.numReviews > 0 ? `(${product.numReviews})` : 'No reviews'}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          {!isOutOfStock ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || addingToCart}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all mb-2 ${
            isOutOfStock
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
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

        {/* Compare */}
        <button
          onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
          className="w-full py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-1.5"
        >
          ⚖️ Compare
        </button>

      </div>
    </div>
  );
};

export default ProductCard;