const QnA = require('../models/QnA');
const Product = require('../models/Product');

const getProductQnA = async (req, res) => {
  try {
    const qnas = await QnA.find({ product: req.params.productId })
      .populate('askedBy', 'name')
      .populate('answeredBy', 'name')
      .sort({ createdAt: -1 });
    res.json(qnas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const qna = await QnA.create({
      product: req.params.productId,
      question,
      askedBy: req.user._id,
    });
    const populated = await qna.populate('askedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    const qna = await QnA.findById(req.params.id);
    if (!qna) return res.status(404).json({ message: 'Question not found' });

    // Verify seller owns the product
    const product = await Product.findById(qna.product);
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can answer' });
    }

    qna.answer = answer;
    qna.answeredBy = req.user._id;
    qna.isAnswered = true;
    await qna.save();

    const populated = await qna.populate(['askedBy', 'answeredBy']);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    await QnA.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProductQnA, askQuestion, answerQuestion, deleteQuestion };