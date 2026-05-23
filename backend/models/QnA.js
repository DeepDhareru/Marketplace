const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnswered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QnA', qnaSchema);