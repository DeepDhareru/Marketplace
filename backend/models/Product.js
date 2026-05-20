const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [{ url: String, public_id: String }],
    stock: { type: Number, default: 1 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);