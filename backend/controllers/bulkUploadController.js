const XLSX = require('xlsx');
const AdmZip = require('adm-zip');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const VALID_CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const bulkUploadProducts = async (req, res) => {
  const extractDir = path.join('uploads', `bulk_extract_${Date.now()}`);

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel, CSV or ZIP file' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows = [];
    let imageMap = {}; // filename → local path

    // ── Handle ZIP file ──────────────────────────────────────
    if (ext === '.zip') {
      fs.mkdirSync(extractDir, { recursive: true });

      const zip = new AdmZip(req.file.path);
      zip.extractAllTo(extractDir, true);
      fs.unlinkSync(req.file.path);

      // Find Excel/CSV file inside ZIP
      const allFiles = fs.readdirSync(extractDir);
      const excelFile = allFiles.find((f) =>
        ['.xlsx', '.xls', '.csv'].includes(path.extname(f).toLowerCase())
      );

      if (!excelFile) {
        cleanup(extractDir);
        return res.status(400).json({
          message: 'No Excel or CSV file found inside ZIP. Include a products.xlsx file.',
        });
      }

      // Build image map from ZIP contents
      allFiles.forEach((f) => {
        const fileExt = path.extname(f).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(fileExt)) {
          imageMap[f.toLowerCase()] = path.join(extractDir, f);
          imageMap[path.basename(f, fileExt).toLowerCase()] = path.join(extractDir, f);
        }
      });

      // Parse Excel from ZIP
      const workbook = XLSX.readFile(path.join(extractDir, excelFile));
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);

    } else {
      // ── Handle plain Excel/CSV ───────────────────────────────
      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
      fs.unlinkSync(req.file.path);
    }

    if (rows.length === 0) {
      cleanup(extractDir);
      return res.status(400).json({ message: 'File is empty' });
    }

    if (rows.length > 100) {
      cleanup(extractDir);
      return res.status(400).json({ message: 'Maximum 100 products per upload' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // Validate required fields
      if (!row.name) { results.errors.push({ row: rowNum, error: 'Name is required' }); continue; }
      if (!row.price || isNaN(row.price) || Number(row.price) <= 0) { results.errors.push({ row: rowNum, error: 'Valid price is required' }); continue; }
      if (!row.description) { results.errors.push({ row: rowNum, error: 'Description is required' }); continue; }
      if (!row.category || !VALID_CATEGORIES.includes(row.category)) {
        results.errors.push({ row: rowNum, error: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}` });
        continue;
      }
      if (row.stock === undefined || row.stock === null || isNaN(row.stock) || Number(row.stock) < 0) {
        results.errors.push({ row: rowNum, error: 'Valid stock quantity is required' });
        continue;
      }

      // ── Upload images to Cloudinary ───────────────────────
      const images = [];
      const imageFilenames = row.images || row.image_filename || row.image || '';

      if (imageFilenames && Object.keys(imageMap).length > 0) {
        const filenames = String(imageFilenames).split(',').map((f) => f.trim().toLowerCase());

        for (const filename of filenames) {
          const localPath =
            imageMap[filename] ||
            imageMap[path.basename(filename, path.extname(filename)).toLowerCase()];

          if (localPath && fs.existsSync(localPath)) {
            try {
              const uploaded = await cloudinary.uploader.upload(localPath, {
                folder: 'marketplace',
                resource_type: 'image',
              });
              images.push({ url: uploaded.secure_url, public_id: uploaded.public_id });
            } catch (uploadErr) {
              console.error(`Image upload failed for ${filename}:`, uploadErr.message);
            }
          }
        }
      }

      try {
        const product = await Product.create({
          name: String(row.name).trim(),
          description: String(row.description).trim(),
          price: Number(row.price),
          category: String(row.category).trim(),
          stock: Number(row.stock),
          images,
          seller: req.user._id,
          isApproved: true,
        });
        results.success.push({
          row: rowNum,
          name: product.name,
          id: product._id,
          imagesUploaded: images.length,
        });
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    // Cleanup extracted files
    cleanup(extractDir);

    res.json({
      message: `Upload complete. ${results.success.length} products added, ${results.errors.length} errors.`,
      success: results.success,
      errors: results.errors,
      totalProcessed: rows.length,
    });
  } catch (error) {
    cleanup(extractDir);
    res.status(500).json({ message: error.message });
  }
};

const cleanup = (dir) => {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
};

const downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with noise cancellation and 30hr battery life.',
        price: 2499,
        category: 'Electronics',
        stock: 50,
        images: 'earbuds.jpg',
      },
      {
        name: 'Cotton Casual Shirt',
        description: 'Comfortable slim fit cotton shirt for daily wear.',
        price: 699,
        category: 'Clothing',
        stock: 100,
        images: 'shirt.jpg,shirt2.jpg',
      },
      {
        name: 'Atomic Habits',
        description: 'Bestselling book on building good habits by James Clear.',
        price: 449,
        category: 'Books',
        stock: 60,
        images: '',
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 50 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=product_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bulkUploadProducts, downloadTemplate };