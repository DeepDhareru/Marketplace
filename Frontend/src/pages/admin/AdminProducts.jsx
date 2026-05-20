import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/admin/products');
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Products</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Seller</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                </td>
                <td className="px-6 py-3 font-medium text-gray-800 max-w-[160px] truncate">{product.name}</td>
                <td className="px-6 py-3 text-gray-500">{product.category}</td>
                <td className="px-6 py-3 font-medium text-blue-600">₹{product.price}</td>
                <td className="px-6 py-3 text-gray-500">{product.seller?.name}</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;