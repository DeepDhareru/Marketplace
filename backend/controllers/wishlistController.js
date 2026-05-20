const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ buyer: req.user._id }).populate('products');
    res.json(wishlist || { products: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ buyer: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ buyer: req.user._id, products: [] });

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
      await wishlist.save();
      return res.json({ message: 'Removed from wishlist', wishlisted: false });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ message: 'Added to wishlist', wishlisted: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist };