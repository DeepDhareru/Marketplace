import { useCompare } from '../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';
import { FiX } from 'react-icons/fi';

const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (compareList.length === 0) return (
    <div className="text-center py-20 px-4 text-gray-500 dark:text-gray-400">
      <p className="text-5xl mb-4">⚖️</p>
      <p className="text-lg font-medium mb-2">No products to compare</p>
      <p className="text-sm mb-6">Add up to 3 products to compare side by side</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
      >
        Browse Products
      </button>
    </div>
  );

  const ROWS = [
    {
      label: 'Product',
      render: (p) => (
        <div className="text-center">
          <img
            src={p.images?.[0]?.url || 'https://via.placeholder.com/150'}
            className="w-full h-36 sm:h-44 object-cover rounded-xl mb-3 cursor-pointer"
            alt={p.name}
            onClick={() => navigate(`/product/${p._id}`)}
          />
          <p
            className="font-semibold text-gray-800 dark:text-white text-sm cursor-pointer hover:text-blue-600 transition line-clamp-2"
            onClick={() => navigate(`/product/${p._id}`)}
          >
            {p.name}
          </p>
        </div>
      ),
    },
    {
      label: 'Price',
      render: (p) => (
        <p className="text-xl font-bold text-blue-600 text-center">₹{p.price.toLocaleString('en-IN')}</p>
      ),
    },
    {
      label: 'Category',
      render: (p) => (
        <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full">
          {p.category}
        </span>
      ),
    },
    {
      label: 'Rating',
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <StarRating rating={p.ratings} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({p.numReviews || 0} reviews)
          </span>
        </div>
      ),
    },
    {
      label: 'Stock',
      render: (p) => (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
          p.stock > 10
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : p.stock > 0
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left` : 'Out of Stock'}
        </span>
      ),
    },
    {
      label: 'Seller',
      render: (p) => (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{p.seller?.name || '—'}</p>
      ),
    },
    {
      label: 'Action',
      render: (p) => (
        <button
          onClick={() => addToCart(p._id)}
          disabled={p.stock === 0}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition ${
            p.stock === 0
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      ),
    },
  ];

  // Empty slots for adding more products
  const emptySlots = 3 - compareList.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          ⚖️ Compare Products
        </h1>
        <button
          onClick={clearCompare}
          className="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          Clear All
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-6">
        {ROWS.map((row) => (
          <div key={row.label} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              {row.label}
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
              {compareList.map((product) => (
                <div key={product._id} className="flex justify-center">
                  {row.render(product)}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Remove buttons mobile */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
          {compareList.map((p) => (
            <button
              key={p._id}
              onClick={() => removeFromCompare(p._id)}
              className="flex items-center justify-center gap-1 text-xs text-red-500 border border-red-200 dark:border-red-800 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <FiX size={12} /> Remove
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b dark:border-gray-700 last:border-0">
                  {/* Row label */}
                  <td className="px-5 py-4 w-28 bg-gray-50 dark:bg-gray-700/50 font-medium text-sm text-gray-500 dark:text-gray-400 align-middle whitespace-nowrap">
                    {row.label}
                  </td>

                  {/* Product columns */}
                  {compareList.map((product) => (
                    <td key={product._id} className="px-5 py-4 align-middle">
                      {row.render(product)}
                    </td>
                  ))}

                  {/* Empty slots */}
                  {Array(emptySlots).fill(null).map((_, i) => (
                    <td key={i} className="px-5 py-4 align-middle">
                      {row.label === 'Product' ? (
                        <div
                          onClick={() => navigate('/')}
                          className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl h-36 sm:h-44 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition gap-2"
                        >
                          <span className="text-2xl">➕</span>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Add product</p>
                        </div>
                      ) : (
                        <div className="h-6" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remove buttons desktop */}
        <div className="flex border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="w-28 flex-shrink-0" />
          {compareList.map((p) => (
            <div key={p._id} className="flex-1 px-5 py-3">
              <button
                onClick={() => removeFromCompare(p._id)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-red-500 border border-red-200 dark:border-red-800 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
              >
                <FiX size={12} /> Remove
              </button>
            </div>
          ))}
          {Array(emptySlots).fill(null).map((_, i) => (
            <div key={i} className="flex-1 px-5 py-3" />
          ))}
        </div>
      </div>

    </div>
  );
};

export default ComparePage;