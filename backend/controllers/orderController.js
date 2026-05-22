const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, newOrderSellerEmail, orderStatusEmail } = require('../utils/emailTemplates');
const createNotification = require('../utils/createNotification');

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    const order = await Order.create({
      buyer: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      razorpayOrderId: razorpayOrder.id,
    });
    res.status(201).json({ order, razorpayOrderId: razorpayOrder.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId },
      { paymentStatus: 'paid', razorpayPaymentId, status: 'processing' },
      { new: true }
    );

    await Cart.findOneAndDelete({ buyer: req.user._id });

    // Send confirmation email to buyer
    const buyer = await User.findById(req.user._id);
    await sendEmail({
      to: buyer.email,
      subject: 'Order Confirmed - Marketplace',
      html: orderConfirmationEmail(order, buyer),
    });

    // Notify buyer in-app
    await createNotification({
      userId: req.user._id,
      title: 'Order Confirmed! 🎉',
      message: `Your order of ₹${order.totalAmount} has been placed successfully.`,
      type: 'order',
      link: '/my-orders',
    });

    // Send notification to sellers
    const productIds = order.items.map(i => i.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate('seller', 'name email _id');
    const uniqueSellers = [];
    const seenIds = new Set();
    for (const p of products) {
      if (p.seller && !seenIds.has(p.seller._id.toString())) {
        seenIds.add(p.seller._id.toString());
        uniqueSellers.push(p.seller);
      }
    }

    for (const seller of uniqueSellers) {
      // Email to seller
      await sendEmail({
        to: seller.email,
        subject: 'New Order Received - Marketplace',
        html: newOrderSellerEmail(order, seller.name),
      });

      // In-app notification to seller
      await createNotification({
        userId: seller._id,
        title: 'New Order Received! 📦',
        message: `You have a new order worth ₹${order.totalAmount}. Process it now.`,
        type: 'order',
        link: '/seller/orders',
      });
    }

    res.json({ message: 'Payment verified', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({ path: 'items.product', match: { seller: req.user._id } })
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    const filtered = orders.filter(o => o.items.some(i => i.product));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send status update email to buyer
    const buyer = await User.findById(order.buyer);
    await sendEmail({
      to: buyer.email,
      subject: `Order ${req.body.status} - Marketplace`,
      html: orderStatusEmail(order, buyer, req.body.status),
    });

    // In-app notification to buyer
    await createNotification({
      userId: order.buyer,
      title: 'Order Status Updated 📬',
      message: `Your order status has been updated to "${req.body.status}".`,
      type: 'order',
      link: '/my-orders',
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getMyOrders, getSellerOrders, updateOrderStatus };