const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'paid'], default: 'pending' },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    note: { type: String, default: '' },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);