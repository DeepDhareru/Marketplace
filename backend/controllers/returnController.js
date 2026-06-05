const Return = require('../models/Return');
const Order = require('../models/Order');
const User = require('../models/User');
const createNotification = require('../utils/createNotification');
const sendEmail = require('../utils/sendEmail');

const RETURN_WINDOW_DAYS = 7;

const requestReturn = async (req, res) => {
  try {
    const { orderId, reason, description, items } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check buyer owns the order
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your order' });
    }

    // Check order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    // Check return window (7 days)
    const deliveredAt = new Date(order.updatedAt);
    const daysDiff = (new Date() - deliveredAt) / (1000 * 60 * 60 * 24);
    if (daysDiff > RETURN_WINDOW_DAYS) {
      return res.status(400).json({
        message: `Return window of ${RETURN_WINDOW_DAYS} days has expired`,
      });
    }

    // Check no existing return for this order
    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) {
      return res.status(400).json({ message: 'A return request already exists for this order' });
    }

    // Get seller from first product
    const firstItem = order.items[0];
    const sellerId = firstItem?.product?.seller || firstItem?.product;

    // Calculate refund amount
    const returnItems = items || order.items.map((i) => ({
      product: i.product._id || i.product,
      quantity: i.quantity,
      price: i.price,
    }));

    const refundAmount = returnItems.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );

    const returnRequest = await Return.create({
      order: orderId,
      buyer: req.user._id,
      seller: sellerId,
      items: returnItems,
      reason,
      description,
      refundAmount,
      status: 'pending',
    });

    // Notify seller
    await createNotification({
      userId: sellerId,
      title: '↩️ Return Request',
      message: `A buyer has requested a return for order #${orderId.toString().slice(-6)}. Reason: ${reason}`,
      type: 'order',
      link: '/seller/returns',
    });

    // Notify buyer
    await createNotification({
      userId: req.user._id,
      title: 'Return Request Submitted',
      message: `Your return request has been submitted. The seller will respond within 2-3 business days.`,
      type: 'order',
      link: '/my-returns',
    });

    res.status(201).json(returnRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyReturns = async (req, res) => {
  try {
    const returns = await Return.find({ buyer: req.user._id })
      .populate('order', 'totalAmount createdAt')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSellerReturns = async (req, res) => {
  try {
    const returns = await Return.find({ seller: req.user._id })
      .populate('buyer', 'name email')
      .populate('order', 'totalAmount createdAt')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReturnStatus = async (req, res) => {
  try {
    const { status, sellerNote } = req.body;
    const returnRequest = await Return.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('seller', 'name');

    if (!returnRequest) return res.status(404).json({ message: 'Return not found' });

    // Verify seller owns this return
    if (returnRequest.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    returnRequest.status = status;
    returnRequest.sellerNote = sellerNote || '';

    // If approved — add refund credits to buyer wallet
    if (status === 'approved' || status === 'refunded') {
      await User.findByIdAndUpdate(returnRequest.buyer._id, {
        $inc: { referralCredits: returnRequest.refundAmount },
      });

      // Update order status
      await Order.findByIdAndUpdate(returnRequest.order, {
        status: 'cancelled',
      });

      // Notify buyer about refund
      await createNotification({
        userId: returnRequest.buyer._id,
        title: '✅ Return Approved!',
        message: `Your return of ₹${returnRequest.refundAmount} has been approved. Credits added to your wallet.`,
        type: 'order',
        link: '/my-returns',
      });
    } else if (status === 'rejected') {
      await createNotification({
        userId: returnRequest.buyer._id,
        title: '❌ Return Rejected',
        message: `Your return request was rejected. ${sellerNote ? 'Reason: ' + sellerNote : ''}`,
        type: 'order',
        link: '/my-returns',
      });
    }

    await returnRequest.save();
    res.json(returnRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('order', 'totalAmount')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestReturn,
  getMyReturns,
  getSellerReturns,
  updateReturnStatus,
  getAdminReturns,
};