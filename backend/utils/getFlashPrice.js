const FlashSale = require('../models/FlashSale');

const getFlashPrice = async (productId, originalPrice) => {
  try {
    const now = new Date();
    const sale = await FlashSale.findOne({
      product: productId,
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    });

    if (sale) {
      return {
        price: sale.salePrice,
        isOnSale: true,
        discountPercent: sale.discountPercent,
        originalPrice,
      };
    }

    return {
      price: originalPrice,
      isOnSale: false,
      discountPercent: 0,
      originalPrice,
    };
  } catch {
    return { price: originalPrice, isOnSale: false };
  }
};

module.exports = getFlashPrice;