import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });

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

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post(`/reviews/${id}`, review);
      setReviews([...reviews, data]);
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow p-6">
        {/* Images */}
        <div>
          <img
            src={product.images?.[mainImage]?.url || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-72 object-cover rounded-xl mb-3"
          />
          <div className="flex gap-2 flex-wrap">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img.url}
                onClick={() => setMainImage(i)}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                  mainImage === i ? 'border-blue-500' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <StarRating rating={product.ratings} />
          <p className="text-sm text-gray-500 mb-4">{product.numReviews} reviews</p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-3xl font-bold text-blue-600 mb-2">₹{product.price}</p>
          <p className="text-sm text-gray-500 mb-4">
            Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Sold by: <span className="font-medium text-gray-700">{product.seller?.name}</span>
          </p>
          {product.stock > 0 && (
            <button
              onClick={() => addToCart(product._id)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium text-gray-800">{r.buyer?.name}</p>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Review */}
        {user && user.role === 'buyer' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>{r} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;