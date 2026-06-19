const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    const filter = {};
    if (keyword) filter.name = { $regex: keyword, $options: 'i' };
    if (category) filter.category = category;
    const products = await Product.find(filter).populate('seller', 'name email isVerified');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Upload each file to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'marketplace',
        });
        images.push({ url: result.secure_url, public_id: result.public_id });
        // Delete local file after upload
        fs.unlinkSync(file.path);
      }
    }

    const product = await Product.create({
      name, description, price, category, stock, images,
      seller: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Verify seller owns this product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update text fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

    // Handle removed images (sent as JSON string array of public_ids to remove)
    if (req.body.removedImages) {
      const removedIds = JSON.parse(req.body.removedImages);
      for (const publicId of removedIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete image:', publicId, err.message);
        }
      }
      product.images = product.images.filter(
        (img) => !removedIds.includes(img.public_id)
      );
    }

    // Handle new images upload
    if (req.files && req.files.length > 0) {
      const uploadedImages = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'marketplace',
        });
        uploadedImages.push({ url: result.secure_url, public_id: result.public_id });
        fs.unlinkSync(file.path);
      }
      product.images = [...product.images, ...uploadedImages];
    }

    // Enforce max 5 images
    if (product.images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per product' });
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getSellerProducts };