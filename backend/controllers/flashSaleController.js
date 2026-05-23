const FlashSale = require('../models/FlashSale');
const Product = require('../models/Product');

const createFlashSale = async (req, res) => {
  try {
    const { productId, discountPercent, startTime, endTime } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your product' });
    }

    const salePrice = Math.round(product.price - (product.price * discountPercent) / 100);

    // Deactivate existing sale for same product
    await FlashSale.updateMany({ product: productId }, { isActive: false });

    const sale = await FlashSale.create({
      product: productId,
      discountPercent,
      startTime,
      endTime,
      salePrice,
      originalPrice: product.price,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();
    const sales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).populate('product', 'name images price category ratings seller');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerFlashSales = async (req, res) => {
  try {
    const sales = await FlashSale.find({ createdBy: req.user._id })
      .populate('product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFlashSale = async (req, res) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createFlashSale, getActiveFlashSales, getSellerFlashSales, deleteFlashSale };