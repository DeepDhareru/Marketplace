import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Electronics', stock: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

 const generateDescription = async () => {
  if (!form.name.trim()) return toast.error('Enter product name first');
  setAiLoading(true);
  try {
    console.log('Calling AI with:', form.name, form.category, form.price);
    const { data } = await API.post('/ai/generate-description', {
      name: form.name,
      category: form.category,
      price: form.price,
    });
    setForm((prev) => ({ ...prev, description: data.description }));
    toast.success('Description generated! ✨');
  } catch (err) {
    console.log('Error:', err.response?.status, err.response?.data);
    toast.error(err.response?.data?.message || 'AI generation failed');
  } finally {
    setAiLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      images.forEach((img) => formData.append('images', img));

      await API.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product added!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Add New Product</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Wireless Earbuds"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (₹)
              </label>
              <input
                type="number" name="price" value={form.price}
                onChange={handleChange} required min="0"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock
              </label>
              <input
                type="number" name="stock" value={form.stock}
                onChange={handleChange} required min="0"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Description with AI button */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate with AI</>
                )}
              </button>
            </div>
            <textarea
              name="description" value={form.description}
              onChange={handleChange} required rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe your product or click 'Generate with AI'..."
            />
            {form.description && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {form.description.length} characters
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Images
            </label>
            <input
              type="file" multiple accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5"
            />
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    className="w-16 h-16 object-cover rounded-lg border dark:border-gray-600"
                    alt={`preview ${i}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;