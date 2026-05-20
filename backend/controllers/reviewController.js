const Review = require('../models/Review');
const Product = require('../models/Product');

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ product: req.params.productId, buyer: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

    const review = await Review.create({
      product: req.params.productId,
      buyer: req.user._id,
      rating,
      comment,
    });

    const reviews = await Review.find({ product: req.params.productId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, { ratings: avg, numReviews: reviews.length });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('buyer', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getProductReviews };