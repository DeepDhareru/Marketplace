import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import ProductRecommendations from '../components/ProductRecommendations';
import RecentlyViewed from '../components/RecentlyViewed';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/reviews/${id}`),
        ]);
        setProduct(pRes.data);
        setReviews(rRes.data);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const shareProduct = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Marketplace!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard! 🔗');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await API.post(`/reviews/${id}`, review);
      setReviews([...reviews, data]);
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  useRecentlyViewed(id);

  if (loading) return <Loader />;
  if (!product) return (
    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
      Product not found
    </div>
  );

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-blue-600 transition">
          Home
        </button>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span className="text-gray-800 dark:text-white truncate max-w-xs">{product.name}</span>
      </div>

      {/* Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-8">

        {/* Images */}
        <div>
          <div className="relative">
            <img
              src={product.images?.[mainImage]?.url || 'https://via.placeholder.com/400'}
              alt={product.name}
              className="w-full h-80 object-cover rounded-xl mb-3"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  onClick={() => setMainImage(i)}
                  alt={`view ${i + 1}`}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition ${
                    mainImage === i
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {/* Category badge */}
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
            {product.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {product.name}
          </h1>

          {/* Rating summary */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.ratings} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {product.description}
          </p>

          <p className="text-3xl font-bold text-blue-600 mb-2">₹{product.price}</p>

          {/* Stock indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.stock > 10
                ? 'In Stock'
                : product.stock > 0
                ? `Only ${product.stock} left!`
                : 'Out of Stock'}
            </p>
          </div>

          {/* Seller info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sold by:{' '}
              <span className="font-semibold text-gray-800 dark:text-white">
                {product.seller?.name}
              </span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {product.seller?.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            {product.stock > 0 ? (
              <button
                onClick={() => addToCart(product._id)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                🛒 Add to Cart
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={shareProduct}
              className="w-full border border-blue-500 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 transition flex items-center justify-center gap-2"
            >
              🔗 Share Product
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-xl">
              <span className="text-2xl font-bold text-blue-600">{averageRating}</span>
              <div>
                <StarRating rating={product.ratings} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{reviews.length} reviews</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-2">💬</p>
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((r) => (
              <div key={r._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                      {r.buyer?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {r.buyer?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Review Form */}
        {user && user.role === 'buyer' && (
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Write a Review
            </h3>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReview({ ...review, rating: star })}
                      className={`text-2xl transition ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 dark:text-gray-400 self-center ml-1">
                    {review.rating} / 5
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comment
                </label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Not logged in message */}
        {!user && (
          <div className="border-t dark:border-gray-700 pt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Login
              </button>{' '}
              to write a review
            </p>
          </div>
        )}
      </div>
      {/* Recommendations */}
        <ProductRecommendations
          category={product.category}
          currentProductId={product._id}
        />

        {/* Recently Viewed */}
        <RecentlyViewed currentProductId={id} />
    </div>
  );
};

export default ProductDetail;