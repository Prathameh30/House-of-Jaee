// utils/sendOrderConfirmationEmail.js
const transporter = require('../config/mailer');

async function sendOrderConfirmationEmail(order) {
  if (!order.email) return; // skip silently if guest didn't provide email

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.product_name} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">₹${Number(item.line_total).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3d2b1f;">
      <div style="background:linear-gradient(90deg,#7a2331,#c9a86a,#7a2331);height:4px;"></div>
      <div style="padding:24px 8px;">
        <h2 style="color:#7a2331;">Thank you for your order, ${order.customer_name}!</h2>
        <p>Your order has been placed successfully. Here are your details:</p>

        <div style="background:#faf6f0;border:1px solid #e5d9c3;padding:16px;border-radius:4px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:#6b5b4d;">Order ID</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#7a2331;">${order.order_number}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          ${itemsHtml}
        </table>

        <table style="width:100%;font-size:14px;">
          <tr><td>Subtotal</td><td style="text-align:right;">₹${Number(order.subtotal).toFixed(2)}</td></tr>
          <tr><td>Delivery</td><td style="text-align:right;">${Number(order.delivery_charge) === 0 ? 'FREE' : `₹${Number(order.delivery_charge).toFixed(2)}`}</td></tr>
          <tr style="font-weight:bold;font-size:16px;"><td>Total</td><td style="text-align:right;">₹${Number(order.total_amount).toFixed(2)}</td></tr>
        </table>

        <p style="margin-top:20px;font-size:14px;">
          <strong>Delivery Address:</strong><br/>
          ${order.address_line}, ${order.city}, ${order.state} - ${order.pin_code}
        </p>

        <p style="margin-top:20px;font-size:13px;color:#6b5b4d;">
          Please save your Order ID (<strong>${order.order_number}</strong>) to track your order anytime at our
          Order Tracking page.
        </p>
      </div>
      <div style="background:#3d2b1f;color:#e5d9c3;text-align:center;padding:12px;font-size:12px;">
        House of Jaee — Crafted with care for the love of sarees.
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"House of Jaee" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `Order Confirmed — ${order.order_number}`,
      html,
    });
  } catch (err) {
    // Never let email failure break the order flow — just log it
    console.error('Failed to send order confirmation email:', err.message);
  }
}

module.exports = sendOrderConfirmationEmail;