const XLSX = require('xlsx');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

const bulkUploadProducts = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload an Excel or CSV file' });

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    fs.unlinkSync(req.file.path);

    if (rows.length === 0) {
      return res.status(400).json({ message: 'File is empty' });
    }

    if (rows.length > 100) {
      return res.status(400).json({ message: 'Maximum 100 products per upload' });
    }

    const VALID_CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other'];
    const results = { success: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      // Validate required fields
      if (!row.name) {
        results.errors.push({ row: rowNum, error: 'Name is required' });
        continue;
      }
      if (!row.price || isNaN(row.price) || row.price <= 0) {
        results.errors.push({ row: rowNum, error: 'Valid price is required' });
        continue;
      }
      if (!row.description) {
        results.errors.push({ row: rowNum, error: 'Description is required' });
        continue;
      }
      if (!row.category || !VALID_CATEGORIES.includes(row.category)) {
        results.errors.push({
          row: rowNum,
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
        continue;
      }
      if (!row.stock || isNaN(row.stock) || row.stock < 0) {
        results.errors.push({ row: rowNum, error: 'Valid stock quantity is required' });
        continue;
      }

      try {
        const product = await Product.create({
          name: String(row.name).trim(),
          description: String(row.description).trim(),
          price: Number(row.price),
          category: String(row.category).trim(),
          stock: Number(row.stock),
          images: [],
          seller: req.user._id,
          isApproved: true,
        });
        results.success.push({ row: rowNum, name: product.name, id: product._id });
      } catch (err) {
        results.errors.push({ row: rowNum, error: err.message });
      }
    }

    res.json({
      message: `Upload complete. ${results.success.length} products added, ${results.errors.length} errors.`,
      success: results.success,
      errors: results.errors,
      totalProcessed: rows.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadTemplate = async (req, res) => {
  try {
    const templateData = [
      {
        name: 'Sample Product',
        description: 'This is a sample product description',
        price: 999,
        category: 'Electronics',
        stock: 50,
      },
      {
        name: 'Another Product',
        description: 'Another product description here',
        price: 499,
        category: 'Clothing',
        stock: 100,
      },
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 50 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
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