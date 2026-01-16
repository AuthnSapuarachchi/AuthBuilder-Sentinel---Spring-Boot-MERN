import nodemailer from "nodemailer";

// Choose email service: 'brevo' or 'gmail'
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";

let transporterConfig;

if (EMAIL_SERVICE === "gmail") {
  // Gmail Configuration (More reliable)
  // IMPORTANT: Use App Password, not regular Gmail password
  // Generate at: https://myaccount.google.com/apppasswords
  transporterConfig = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };
} else if (EMAIL_SERVICE === "brevo") {
  // Brevo/Sendinblue Configuration
  transporterConfig = {
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };
}

const transporter = nodemailer.createTransport(transporterConfig);

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
    console.error("Please check your email configuration in .env file");
  } else {
    console.log(
      `✅ ${EMAIL_SERVICE.toUpperCase()} SMTP Server is ready to send emails`
    );
  }
});

export default transporter;
