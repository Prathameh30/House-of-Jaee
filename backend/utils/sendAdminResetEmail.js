// utils/sendAdminResetEmail.js
const transporter = require('../config/mailer');

async function sendAdminResetEmail(admin, resetUrl) {
  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3d2b1f;">
      <div style="background:linear-gradient(90deg,#7a2331,#c9a86a,#7a2331);height:4px;"></div>
      <div style="padding:24px 8px;">
        <h2 style="color:#7a2331;">Admin Password Reset</h2>
        <p>Hi ${admin.name},</p>
        <p>We received a request to reset your House of Jaee admin password. Click the button below to set a new one:</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:#7a2331;color:#f7f1e8;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size:13px;color:#6b5b4d;">This link expires in 15 minutes and can only be used once.</p>
        <p style="font-size:13px;color:#6b5b4d;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      </div>
      <div style="background:#3d2b1f;color:#e5d9c3;text-align:center;padding:12px;font-size:12px;">
        House of Jaee — Admin Panel
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"House of Jaee Admin" <${process.env.EMAIL_USER}>`,
    to: admin.email,
    subject: 'Reset Your Admin Password',
    html,
  });
}

module.exports = sendAdminResetEmail;