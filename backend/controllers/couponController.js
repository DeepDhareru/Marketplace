const Coupon = require('../models/Coupon');

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      expiresAt,
      seller: req.user._id,
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: 'Coupon usage limit reached' });
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      discount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: `Coupon applied! You save ₹${discount}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ seller: req.user._id });
    res.json(coupons);
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