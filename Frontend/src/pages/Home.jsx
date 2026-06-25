import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

// ─── Landing Page for guests ───────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '🛍️', title: 'Browse Products', desc: 'Thousands of products across all categories' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Pay safely with Razorpay — UPI, cards, netbanking' },
    { icon: '📦', title: 'Track Orders', desc: 'Real-time order tracking with timeline updates' },
    { icon: '⭐', title: 'Verified Reviews', desc: 'Honest reviews from real buyers' },
    { icon: '⚡', title: 'Flash Sales', desc: 'Limited-time deals with huge discounts' },
    { icon: '🏪', title: 'Sell Online', desc: 'List your products and reach thousands of buyers' },
  ];

  const steps = [
    { step: '1', title: 'Create Account', desc: 'Sign up free as a buyer or seller in seconds' },
    { step: '2', title: 'Browse or List', desc: 'Explore products or start listing your items' },
    { step: '3', title: 'Buy or Sell', desc: 'Pay securely or receive orders and grow your business' },
  ];

  const stats = [
    { value: '10K+', label: 'Products Listed' },
    { value: '5K+', label: 'Happy Buyers' },
    { value: '1K+', label: 'Active Sellers' },
    { value: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white opacity-5 rounded-full" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-white opacity-5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white opacity-5 rounded-full" />
        </div>

        {/* Hero Section - fix mobile padding */}
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white text-gray-900 bg-opacity-20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span>⚡</span>
                <span>India's fastest growing marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Buy & Sell
                <span className="text-blue-200"> Anything</span>
                <br />Online with Ease
              </h1>
              <p className="text-blue-100 text-base sm:text-lg md:text-xl mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                Join thousands of buyers and sellers on Marketplace.
                Secure payments, real-time tracking and amazing deals.
              </p>
              <div className="flex gap-3 justify-center flex-wrap px-4">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-blue-50 transition shadow-lg"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg hover:bg-white hover:text-blue-600 transition"
                >
                  Sign In
                </button>
              </div>
            </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z"
              fill="rgb(249 250 251)" className="dark:fill-gray-900" />
          </svg>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 mb-12 sm:mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Everything you need
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            From browsing to buying, we've got every step covered with powerful features.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-blue-600 dark:bg-blue-800 py-20 mb-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How it Works</h2>
            <p className="text-blue-200">Get started in just 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-2/3 w-full h-0.5 bg-blue-400 opacity-50" />
                )}
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Join as Buyer or Seller
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Choose your role and get started today
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-6 gap-4">

          {/* Buyer Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              I want to Buy
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
              Browse thousands of products, add to cart, pay securely and track your orders in real time.
            </p>
            <ul className="space-y-2 mb-6">
              {['Browse & search products', 'Secure Razorpay payments', 'Order tracking & invoices', 'Wishlist & coupons', 'Write reviews'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-4 h-4 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Join as Buyer
            </button>
          </div>

          {/* Seller Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white bg-opacity-20 text-black text-xs px-2 py-1 rounded-full font-medium">
              Popular
            </div>
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-white mb-2">
              I want to Sell
            </h3>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              List your products and reach thousands of buyers. Manage orders and grow your business online.
            </p>
            <ul className="space-y-2 mb-6">
              {['List unlimited products', 'AI description generator', 'Sales analytics & charts', 'Flash sales & coupons', 'Export orders to CSV'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                  <span className="w-4 h-4  bg-opacity-20 rounded-full flex items-center justify-center text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              Start Selling Free
            </button>
          </div>

        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join thousands of buyers and sellers — it's completely free!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// ─── Main Home Page ────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Show landing page for guests
  if (!user) return <LandingPage />;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (category !== 'All') params.category = category;
      const { data } = await API.get('/products', { params });

      let result = Array.isArray(data) ? data : [];

      if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));
      if (inStock) result = result.filter((p) => p.stock > 0);

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
    if (user) {
      fetchProducts();
      API.get('/flash-sales/active')
        .then(({ data }) => setFlashSales(data))
        .catch(() => {});
    }
  }, [category, sort, inStock, user]);

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
    category !== 'All', minPrice, maxPrice, inStock, sort !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Flash Sale Banner */}
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
            <p className="text-red-100 text-sm">
              Limited time — up to {Math.max(...flashSales.map(s => s.discountPercent))}% off!
            </p>
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

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-5 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range (₹)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number" value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min" min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number" value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max" min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sort} onChange={(e) => setSort(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Availability
              </label>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox" checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
              </label>
              <div className="flex gap-2">
                <button onClick={fetchProducts}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  Apply
                </button>
                <button onClick={clearFilters}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
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
          <button onClick={clearFilters} className="text-blue-600 hover:underline text-sm">
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