const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Return = require('../models/Return');

const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // ── Overview Stats ────────────────────────────────────────
    const [
      totalUsers, totalSellers, totalBuyers,
      totalProducts, totalOrders, totalReturns,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'buyer' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Return.countDocuments(),
    ]);

    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;
    const paidOrders = revenueData[0]?.count || 0;

    const last30Revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: last30Days } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const last7Revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // ── Monthly Revenue (last 12 months) ──────────────────────
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthlyRevenue.map((m) => ({
      month: MONTHS[m._id.month - 1],
      revenue: m.revenue,
      orders: m.orders,
    }));

    // ── Daily Revenue (last 7 days) ───────────────────────────
    const dailyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyData = dailyRevenue.map((d) => ({
      date: new Date(d._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: d.revenue,
      orders: d.orders,
    }));

    // ── Category-wise Sales ───────────────────────────────────
    const categorySales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // ── Top Selling Products ──────────────────────────────────
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          category: '$product.category',
          image: { $arrayElemAt: ['$product.images', 0] },
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // ── Top Sellers ───────────────────────────────────────────
    const topSellers = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.seller',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      {
        $project: {
          name: '$seller.name',
          email: '$seller.email',
          totalRevenue: 1,
          totalOrders: 1,
        },
      },
    ]);

    // ── New Users (last 7 days) ───────────────────────────────
    const newUsers = await User.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const newUsersData = newUsers.map((u) => ({
      date: new Date(u._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      users: u.count,
    }));

    // ── Order Status Breakdown ────────────────────────────────
    const orderStatusData = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      overview: {
        totalUsers, totalSellers, totalBuyers,
        totalProducts, totalOrders, totalReturns,
        totalRevenue, paidOrders,
        last30Revenue: last30Revenue[0]?.total || 0,
        last7Revenue: last7Revenue[0]?.total || 0,
      },
      monthlyData,
      dailyData,
      categorySales,
      topProducts,
      topSellers,
      newUsersData,
      orderStatusData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };