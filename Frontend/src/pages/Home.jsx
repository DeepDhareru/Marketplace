import { useEffect, useState } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import FlashSaleTimer from '../components/FlashSaleTimer';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [flashSales, setFlashSales] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category !== 'All') params.category = category;
      const { data } = await API.get('/products', { params });

      let result = Array.isArray(data) ? data : [];

      // Filter by price range
      if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));

      // Filter by stock
      if (inStock) result = result.filter((p) => p.stock > 0);

      // Sort
      if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
      else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') result.sort((a, b) => b.ratings - a.ratings);
      else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setProducts(result);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort, inStock]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('All');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
  };

  const activeFiltersCount = [
    category !== 'All',
    minPrice,
    maxPrice,
    inStock,
    sort !== 'newest',
  ].filter(Boolean).length;

  useEffect(() => {
    API.get('/flash-sales/active')
      .then(({ data }) => setFlashSales(data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {flashSales.length > 0 && (
  <div
    onClick={() => navigate('/flash-sales')}
    className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-4 mb-6 cursor-pointer hover:opacity-95 transition flex justify-between items-center flex-wrap gap-3"
  >
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white font-bold text-lg">⚡ Flash Sale</span>
        <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {flashSales.length} deals
        </span>
      </div>
      <p className="text-red-100 text-sm">Limited time offers — up to {Math.max(...flashSales.map(s => s.discountPercent))}% off!</p>
    </div>
    <FlashSaleTimer endTime={flashSales[0]?.endTime} size="md" />
  </div>
)}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search products..."
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-lg border transition flex items-center gap-2 ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
          }`}
        >
          🔧 Filters
          {activeFiltersCount > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-5 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range (₹)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Stock & Actions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={fetchProducts}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Clear
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              category === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {products.length} product{products.length !== 1 ? 's' : ''} found
          {keyword && ` for "${keyword}"`}
          {category !== 'All' && ` in ${category}`}
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-20">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg mb-4">No products found</p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:underline text-sm"
          >
            Clear all filters
          </button>
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