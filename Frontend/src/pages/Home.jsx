import { useEffect, useState } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');

  const fetchProducts = async () => {
  setLoading(true);
  try {
    const params = {};
    if (keyword) params.keyword = keyword;
    if (category !== 'All') params.category = category;
    const { data } = await API.get('/products', { params });
    // Fix: ensure data is always an array
    setProducts(Array.isArray(data) ? data : []);
  } catch {
    setProducts([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              category === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;