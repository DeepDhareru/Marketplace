const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number,
      },
    ],
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
    },
    refundAmount: { type: Number, default: 0 },
    sellerNote: { type: String, default: '' },
    images: [{ url: String, public_id: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Return', returnSchema);