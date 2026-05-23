import { useCompare } from '../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from '../components/StarRating';

const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (compareList.length === 0) return (
    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
      <p className="text-5xl mb-4">⚖️</p>
      <p className="text-lg font-medium mb-2">No products to compare</p>
      <p className="text-sm mb-6">Add up to 3 products to compare side by side</p>
      <button
        onClick={() => navigate('/')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Browse Products
      </button>
    </div>
  );

  const ROWS = [
    { label: 'Image', render: (p) => (
      <img src={p.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-40 object-cover rounded-xl" alt={p.name} />
    )},
    { label: 'Name', render: (p) => <p className="font-semibold text-gray-800 dark:text-white">{p.name}</p> },
    { label: 'Price', render: (p) => <p className="text-xl font-bold text-blue-600">₹{p.price}</p> },
    { label: 'Category', render: (p) => <span className="text-sm text-gray-500 dark:text-gray-400">{p.category}</span> },
    { label: 'Rating', render: (p) => (
      <div className="flex items-center gap-1">
        <StarRating rating={p.ratings} />
        <span className="text-xs text-gray-500 dark:text-gray-400">({p.numReviews})</span>
      </div>
    )},
    { label: 'Stock', render: (p) => (
      <span className={`text-sm font-medium ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {p.stock > 0 ? `${p.stock} available` : 'Out of stock'}
      </span>
    )},
    { label: 'Seller', render: (p) => <span className="text-sm text-gray-600 dark:text-gray-300">{p.seller?.name}</span> },
    { label: 'Action', render: (p) => (
      <button
        onClick={() => addToCart(p._id)}
        disabled={p.stock === 0}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Add to Cart
      </button>
    )},
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          ⚖️ Compare Products
        </h1>
        <button
          onClick={clearCompare}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b dark:border-gray-700 last:border-0">
                <td className="px-6 py-4 w-28 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-600 dark:text-gray-300">
                  {row.label}
                </td>
                {compareList.map((product) => (
                  <td key={product._id} className="px-6 py-4 align-top">
                    {row.render(product)}
                  </td>
                ))}
                {/* Empty cells if less than 3 products */}
                {Array(3 - compareList.length).fill(null).map((_, i) => (
                  <td key={i} className="px-6 py-4">
                    <div
                      onClick={() => navigate('/')}
                      className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl h-20 flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
                    >
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        + Add product
                      </p>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remove Buttons */}
      <div className="flex gap-4 mt-4">
        <div className="w-28" />
        {compareList.map((p) => (
          <button
            key={p._id}
            onClick={() => removeFromCompare(p._id)}
            className="flex-1 text-sm text-red-500 hover:text-red-700 border border-red-200 dark:border-red-900 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Remove {p.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ComparePage;