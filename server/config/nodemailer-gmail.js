import nodemailer from "nodemailer";

// Gmail SMTP Configuration
// IMPORTANT: You need to generate an App Password from Google Account settings
// Go to: https://myaccount.google.com/apppasswords

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    // accept multiple common env names as fallbacks (helps if .env uses EMAIL_* or other names)
    user:
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      process.env.EMAIL ||
      process.env.SMTP_EMAIL,
    pass:
      process.env.SMTP_PASSWORD ||
      process.env.EMAIL_PASS ||
      process.env.EMAIL_PASSWORD ||
      process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Gmail SMTP Connection Error:", error);
  } else {
    console.log("✅ Gmail SMTP Server is ready to send emails");
  }
});

export default transporter;
