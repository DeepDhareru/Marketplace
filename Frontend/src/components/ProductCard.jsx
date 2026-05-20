import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';
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
    <div className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden relative">
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow"
      >
        <FiHeart
          size={18}
          className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'}
        />
      </button>
      <img
        src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        className="w-full h-48 object-cover cursor-pointer"
        onClick={() => navigate(`/product/${product._id}`)}
      />
      <div className="p-4">
        <h3
          className="font-semibold text-gray-800 truncate cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        <StarRating rating={product.ratings} />
        <div className="flex justify-between items-center mt-3">
          <span className="text-blue-600 font-bold text-lg">₹{product.price}</span>
          <button
            onClick={() => addToCart(product._id)}
            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;