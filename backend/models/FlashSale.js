const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    discountPercent: { type: Number, required: true, min: 1, max: 99 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    salePrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlashSale', flashSaleSchema);