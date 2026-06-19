import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiImage, FiStar } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
const MAX_IMAGES = 5;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [existingImages, setExistingImages] = useState([]); // images already on server [{url, public_id}]
  const [removedImageIds, setRemovedImageIds] = useState([]); // public_ids to delete
  const [newImages, setNewImages] = useState([]); // File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // local preview URLs
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          stock: data.stock,
        });
        setExistingImages(data.images || []);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const totalImageCount = existingImages.length + newImages.length;

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - totalImageCount;

    if (remainingSlots <= 0) {
      return toast.error(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);
    if (fileArray.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more image(s) can be added`);
    }

    const validFiles = filesToAdd.filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    setNewImages((prev) => [...prev, ...validFiles]);
    const previews = validFiles.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeExistingImage = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId));
    setRemovedImageIds((prev) => [...prev, publicId]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalImageCount === 0) {
      return toast.error('Please keep at least 1 product image');
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('stock', form.stock);
      formData.append('removedImages', JSON.stringify(removedImageIds));
      newImages.forEach((file) => formData.append('images', file));

      await API.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Product updated!');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Edit Product</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Image Management ────────────────────────── */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Images
              </label>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {totalImageCount}/{MAX_IMAGES}
              </span>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">

              {/* Existing images */}
              {existingImages.map((img, i) => (
                <div key={img.public_id} className="relative group aspect-square">
                  <img
                    src={img.url}
                    alt={`Product ${i + 1}`}
                    className="w-full h-full object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                  />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <FiStar size={9} /> Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.public_id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newImagePreviews.map((preview, i) => (
                <div key={preview} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt={`New ${i + 1}`}
                    className="w-full h-full object-cover rounded-xl border-2 border-green-400 dark:border-green-600"
                  />
                  <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {totalImageCount < MAX_IMAGES && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${
                    dragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiUpload size={16} className="text-gray-400 dark:text-gray-500 mb-1" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Add</span>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
              className="hidden"
            />

            <p className="text-xs text-gray-400 dark:text-gray-500">
              First image is the main product photo. JPG, PNG or WEBP, max 5MB each.
            </p>

            {totalImageCount === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ At least 1 image is required
              </p>
            )}
          </div>

          {/* ── Text Fields ──────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} required
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (₹)
              </label>
              <input
                type="number" name="price" value={form.price}
                onChange={handleChange} required min="0"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description" value={form.description}
              onChange={handleChange} required rows={3}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || totalImageCount === 0}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;