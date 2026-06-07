const Payout = require('../models/Payout');
const Order = require('../models/Order');
const Product = require('../models/Product');

const PLATFORM_FEE = 0.05; // 5% platform fee

const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get all paid orders with seller's products
    const orders = await Order.find({ paymentStatus: 'paid' })
      .populate({ path: 'items.product', match: { seller: sellerId } })
      .sort({ createdAt: -1 });

    const sellerOrders = orders.filter(o => o.items.some(i => i.product));

    // Calculate earnings per order
    const earningsList = sellerOrders.map((order) => {
      const sellerItems = order.items.filter((i) => i.product);
      const grossAmount = sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const platformFee = Math.round(grossAmount * PLATFORM_FEE);
      const netAmount = grossAmount - platformFee;
      return {
        orderId: order._id,
        date: order.createdAt,
        grossAmount,
        platformFee,
        netAmount,
        items: sellerItems.map((i) => ({
          name: i.product?.name,
          quantity: i.quantity,
          price: i.price,
        })),
      };
    });

    // Monthly breakdown
    const monthlyMap = {};
    earningsList.forEach((e) => {
      const month = new Date(e.date).toLocaleString('default', {
        month: 'short', year: '2-digit',
      });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, gross: 0, fees: 0, net: 0, orders: 0 };
      }
      monthlyMap[month].gross += e.grossAmount;
      monthlyMap[month].fees += e.platformFee;
      monthlyMap[month].net += e.netAmount;
      monthlyMap[month].orders += 1;
    });

    // Payout summary
    const payouts = await Payout.find({ seller: sellerId }).sort({ createdAt: -1 });
    const totalPaid = payouts
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalEarned = earningsList.reduce((sum, e) => sum + e.netAmount, 0);
    const totalPending = totalEarned - totalPaid;

    res.json({
      summary: {
        totalGross: earningsList.reduce((sum, e) => sum + e.grossAmount, 0),
        totalFees: earningsList.reduce((sum, e) => sum + e.platformFee, 0),
        totalEarned,
        totalPaid,
        totalPending: Math.max(0, totalPending),
        totalOrders: sellerOrders.length,
        platformFeePercent: PLATFORM_FEE * 100,
      },
      monthlyBreakdown: Object.values(monthlyMap).slice(-6),
      recentEarnings: earningsList.slice(0, 10),
      payouts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestPayout = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    const payout = await Payout.create({
      seller: req.user._id,
      amount,
      status: 'pending',
      note: bankDetails || '',
    });

    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePayoutStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const payout = await Payout.findByIdAndUpdate(
      req.params.id,
      {
        status,
        note: note || '',
        processedAt: status === 'paid' ? new Date() : null,
      },
      { new: true }
    ).populate('seller', 'name email');
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSellerEarnings, requestPayout, getAllPayouts, updatePayoutStatus };