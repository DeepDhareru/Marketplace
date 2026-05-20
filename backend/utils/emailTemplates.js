const orderConfirmationEmail = (order, user) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563eb; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🛒 Marketplace</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">Order Confirmed! 🎉</h2>
    <p style="color: #6b7280;">Hi ${user.name}, your order has been placed successfully.</p>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #6b7280; margin: 0 0 8px;">Order ID</p>
      <p style="font-family: monospace; font-weight: bold; color: #1f2937;">${order._id}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
      <p style="color: #6b7280; margin: 0 0 8px;">Total Amount</p>
      <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0;">₹${order.totalAmount}</p>
    </div>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="font-weight: bold; color: #1f2937; margin: 0 0 12px;">Items Ordered</p>
      ${order.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="color: #374151;">${item.quantity}x item</span>
          <span style="color: #2563eb; font-weight: bold;">₹${item.price * item.quantity}</span>
        </div>
      `).join('')}
    </div>
    <p style="color: #6b7280;">Shipping to: <strong>${order.shippingAddress}</strong></p>
    <p style="color: #6b7280; font-size: 13px; margin-top: 30px;">Thank you for shopping with us!</p>
  </div>
</div>
`;

const newOrderSellerEmail = (order, sellerName) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563eb; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🛒 Marketplace</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">New Order Received! 📦</h2>
    <p style="color: #6b7280;">Hi ${sellerName}, you have a new order to fulfill.</p>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="color: #6b7280; margin: 0 0 8px;">Order ID</p>
      <p style="font-family: monospace; font-weight: bold; color: #1f2937;">${order._id}</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
      <p style="color: #6b7280; margin: 0 0 8px;">Total Amount</p>
      <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0;">₹${order.totalAmount}</p>
    </div>
    <p style="color: #6b7280;">Ship to: <strong>${order.shippingAddress}</strong></p>
    <p style="color: #6b7280;">Please log in to your seller dashboard to process this order.</p>
  </div>
</div>
`;

const orderStatusEmail = (order, user, status) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #2563eb; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🛒 Marketplace</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    <h2 style="color: #1f2937;">Order Update 📬</h2>
    <p style="color: #6b7280;">Hi ${user.name}, your order status has been updated.</p>
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="color: #6b7280; margin: 0 0 8px;">New Status</p>
      <p style="font-size: 22px; font-weight: bold; color: #2563eb; text-transform: uppercase;">${status}</p>
      <p style="font-family: monospace; color: #9ca3af; font-size: 13px;">Order: ${order._id}</p>
    </div>
    <p style="color: #6b7280; font-size: 13px;">Thank you for shopping with us!</p>
  </div>
</div>
`;

module.exports = { orderConfirmationEmail, newOrderSellerEmail, orderStatusEmail };