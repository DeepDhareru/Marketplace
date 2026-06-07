import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';


const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products/seller/my');
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <button
          onClick={() => navigate('/seller/products/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="mb-4">No products yet</p>
          <button
            onClick={() => navigate('/seller/products/add')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow overflow-hidden">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                <p className="text-blue-600 font-bold mb-3">₹{product.price}</p>
                <p className="text-xs text-gray-500 mb-3">Stock: {product.stock}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                    className="flex-1 border border-blue-500 text-blue-500 py-1.5 rounded-lg text-sm hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 border border-red-400 text-red-500 py-1.5 rounded-lg text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;