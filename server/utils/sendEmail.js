const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetLink, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'PollSystem <noreply@pollsystem.com>',
    to: toEmail,
    subject: '🔐 Reset Your PollSystem Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8f7ff; padding: 2rem; border-radius: 12px;">
        <div style="background: #1e1b4b; padding: 1.5rem; border-radius: 10px; text-align: center; margin-bottom: 1.5rem;">
          <h1 style="color: white; margin: 0; font-size: 1.5rem;">🗳️ PollSystem</h1>
        </div>

        <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h2 style="color: #1e1b4b; margin-top: 0;">Hi ${userName},</h2>
          <p style="color: #6b7280;">We received a request to reset your password. Click the button below to create a new one.</p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${resetLink}" 
               style="background: #6366f1; color: white; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #6b7280; font-size: 0.875rem;">
            This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
          </p>

          <div style="border-top: 1px solid #e5e7eb; margin-top: 1.5rem; padding-top: 1rem;">
            <p style="color: #9ca3af; font-size: 0.8rem; margin: 0;">
              Or copy this link: <a href="${resetLink}" style="color: #6366f1;">${resetLink}</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };