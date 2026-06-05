const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

    if (!expiresAt) return res.status(400).json({ message: 'Expiry date is required' });

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxUses: maxUses || 100,
      expiresAt: new Date(expiresAt),
      seller: req.user._id,
      isActive: true,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, cartItems } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // Check coupon exists
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    // Check coupon is active
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });

    // Fix 1 — Check expiry properly
    const now = new Date();
    const expiry = new Date(coupon.expiresAt);
    if (now > expiry) {
      return res.status(400).json({
        message: `Coupon expired on ${expiry.toLocaleDateString('en-IN')}`,
      });
    }

    // Fix 2 — Check max uses
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    // Fix 2 — Check if this buyer already used this coupon
    const buyerUsed = await Order.findOne({
      buyer: req.user._id,
      couponCode: coupon.code,
      paymentStatus: 'paid',
    });
    if (buyerUsed) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    // Fix 3 — Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    // Fix 3 — Check if cart has products from this seller
    if (cartItems && cartItems.length > 0) {
      const productIds = cartItems.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      const sellerProducts = products.filter(
        (p) => p.seller.toString() === coupon.seller.toString()
      );
      if (sellerProducts.length === 0) {
        return res.status(400).json({
          message: "This coupon is only valid for the seller's own products",
        });
      }

      // Calculate discount only on seller's products
      const sellerTotal = cartItems.reduce((sum, item) => {
        const isSellerProduct = sellerProducts.find(
          (p) => p._id.toString() === item.product.toString()
        );
        return isSellerProduct ? sum + item.price * item.quantity : sum;
      }, 0);

      if (sellerTotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum ₹${coupon.minOrderAmount} of seller's products required`,
        });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    // Cap discount at order amount
    discount = Math.min(discount, orderAmount);

    res.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      couponCode: coupon.code,
      message: `Coupon applied! You save ₹${discount}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({ seller: req.user._id }).sort({ createdAt: -1 });

    // Add isExpired flag to each coupon
    const couponsWithStatus = coupons.map((c) => ({
      ...c.toObject(),
      isExpired: new Date(c.expiresAt) < now,
    }));

    res.json(couponsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCoupon, validateCoupon, getMyCoupons, deleteCoupon };