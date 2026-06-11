import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiDownload, FiFile, FiCheck, FiX, FiImage } from 'react-icons/fi';

const BulkUpload = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState('excel');

  const handleFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    const allowedExcel = ['.xlsx', '.xls', '.csv'];
    const allowedZip = ['.zip'];
    const allowed = [...allowedExcel, ...allowedZip];

    if (!allowed.includes(ext)) {
      toast.error('Only Excel (.xlsx, .xls, .csv) or ZIP files allowed');
      return;
    }

    if (ext === '.zip') setUploadMode('zip');
    else setUploadMode('excel');

    setFile(f);
    setResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await API.post('/bulk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(data);
      if (data.errors.length === 0) {
        toast.success(`${data.success.length} products uploaded!`);
      } else {
        toast.success(`${data.success.length} uploaded, ${data.errors.length} errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await API.get('/bulk/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded!');
    } catch {
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Bulk Upload Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload up to 100 products at once with or without images
          </p>
        </div>
        <button
          onClick={() => navigate('/seller/products')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition"
        >
          ← Back
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => { setUploadMode('excel'); setFile(null); setResults(null); }}
          className={`p-4 rounded-2xl border-2 text-left transition ${
            uploadMode === 'excel'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              uploadMode === 'excel' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <FiFile size={16} className={uploadMode === 'excel' ? 'text-blue-600' : 'text-gray-500'} />
            </div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">
              Excel / CSV Only
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload products without images. Add images later from product edit page.
          </p>
        </button>

        <button
          onClick={() => { setUploadMode('zip'); setFile(null); setResults(null); }}
          className={`p-4 rounded-2xl border-2 text-left transition ${
            uploadMode === 'zip'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              uploadMode === 'zip' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <FiImage size={16} className={uploadMode === 'zip' ? 'text-purple-600' : 'text-gray-500'} />
            </div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">
              ZIP with Images
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload products with images. ZIP file contains Excel + image files together.
          </p>
        </button>
      </div>

      {/* Step 1 — Download Template */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-blue-600 dark:text-blue-300">1</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-1">
              Download & Fill Template
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Download the Excel template and fill in your product details.
            </p>

            {/* Columns info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Required columns:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { col: 'name', desc: 'Product name', required: true },
                  { col: 'description', desc: 'Product description', required: true },
                  { col: 'price', desc: 'Price in ₹ (number)', required: true },
                  { col: 'category', desc: 'Electronics/Clothing/Books/Home/Sports/Other', required: true },
                  { col: 'stock', desc: 'Available quantity', required: true },
                  { col: 'images', desc: 'Image filenames e.g. img1.jpg,img2.jpg', required: false },
                ].map((c) => (
                  <div key={c.col} className="flex items-start gap-1.5">
                    <code className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono flex-shrink-0">
                      {c.col}
                    </code>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</span>
                    {!c.required && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">(optional)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              <FiDownload size={15} />
              Download Template
            </button>
          </div>
        </div>
      </div>

      {/* Step 2 — ZIP instructions (only for ZIP mode) */}
      {uploadMode === 'zip' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-purple-600 dark:text-purple-300">2</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-1">
                Create ZIP File with Images
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Put your Excel file and all product images in the same folder, then compress to ZIP.
              </p>

              {/* ZIP structure */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-3 font-mono text-xs">
                <p className="text-gray-500 dark:text-gray-400 mb-2">📁 products.zip</p>
                <div className="pl-4 space-y-1">
                  <p className="text-blue-600 dark:text-blue-400">├── products.xlsx</p>
                  <p className="text-green-600 dark:text-green-400">├── earbuds.jpg</p>
                  <p className="text-green-600 dark:text-green-400">├── shirt.jpg</p>
                  <p className="text-green-600 dark:text-green-400">├── shirt_back.jpg</p>
                  <p className="text-green-600 dark:text-green-400">└── book_cover.png</p>
                </div>
              </div>

              {/* Excel images column example */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  In the Excel images column:
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Single image: <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">earbuds.jpg</code>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Multiple images: <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">shirt.jpg,shirt_back.jpg</code>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    No image: leave the cell empty
                  </p>
                </div>
              </div>

              {/* How to create ZIP */}
              <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  How to create ZIP:
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Windows:</span> Select all files → Right click → Send to → Compressed folder
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Mac:</span> Select all files → Right click → Compress items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Upload File */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            uploadMode === 'zip' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-green-100 dark:bg-green-900'
          }`}>
            <span className={`font-bold ${uploadMode === 'zip' ? 'text-purple-600 dark:text-purple-300' : 'text-green-600 dark:text-green-300'}`}>
              {uploadMode === 'zip' ? '3' : '2'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 dark:text-white mb-1">
              Upload Your {uploadMode === 'zip' ? 'ZIP' : 'Excel/CSV'} File
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {uploadMode === 'zip'
                ? 'Upload the ZIP file containing your Excel and images.'
                : 'Upload your filled Excel or CSV file.'}
            </p>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                dragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : file
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : uploadMode === 'zip'
                  ? 'border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept={uploadMode === 'zip' ? '.zip' : '.xlsx,.xls,.csv'}
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FiFile size={24} className="text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                      {uploadMode === 'zip' && ' — ZIP with images'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                    className="ml-2 text-red-400 hover:text-red-600"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              ) : (
                <>
                  {uploadMode === 'zip'
                    ? <FiImage size={32} className="mx-auto mb-3 text-purple-400" />
                    : <FiUpload size={32} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                  }
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-1">
                    Drop your {uploadMode === 'zip' ? 'ZIP' : 'file'} here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {uploadMode === 'zip'
                      ? 'ZIP file with Excel + images (max 50MB)'
                      : '.xlsx, .xls, .csv (max 5MB, 100 products)'}
                  </p>
                </>
              )}
            </div>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`mt-3 w-full py-3 rounded-xl font-semibold disabled:opacity-50 transition flex items-center justify-center gap-2 text-white ${
                  uploadMode === 'zip'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadMode === 'zip' ? 'Uploading & Processing Images...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Upload {uploadMode === 'zip' ? 'ZIP with Images' : 'Products'}
                  </>
                )}
              </button>
            )}

            {/* ZIP upload note */}
            {uploadMode === 'zip' && file && (
              <p className="text-xs text-purple-600 dark:text-purple-400 text-center mt-2">
                ⏱ ZIP uploads may take longer due to image processing
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Upload Results</h2>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{results.totalProcessed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Rows</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{results.success.length}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Uploaded</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{results.errors.length}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Errors</p>
            </div>
          </div>

          {/* Success List */}
          {results.success.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                <FiCheck size={14} /> Successfully Added
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {results.success.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FiCheck size={12} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">Row {s.row}: {s.name}</span>
                    </div>
                    {s.imagesUploaded > 0 && (
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <FiImage size={11} />
                        {s.imagesUploaded} image{s.imagesUploaded > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error List */}
          {results.errors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
                <FiX size={14} /> Errors
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {results.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                    <FiX size={12} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Row {e.row}: {e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setFile(null); setResults(null); }}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Upload Another
            </button>
            <button
              onClick={() => navigate('/seller/products')}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              View Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;