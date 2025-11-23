import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Updated to accept an optional 'html' parameter
export const sendAdminNotification = async (subject: string, text: string, html?: string) => {
  if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
    console.warn("⚠️ Email credentials missing. Skipping email notification.");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `CabService Alert: ${subject}`,
      text: text, // Fallback for email clients that don't support HTML
      html: html || text.replace(/\n/g, '<br>'), // Use HTML or convert newlines to breaks
    });
    console.log("✅ Email sent to admin");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};