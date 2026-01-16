import dotenv from "dotenv";
dotenv.config();

import transporter from "./config/nodemailer-gmail.js";

const from =
  process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL;
const to = process.env.TEST_EMAIL || from;

if (!from) {
  console.error(
    "ERROR: sender email not set. Set SMTP_USER or EMAIL_USER in .env"
  );
  process.exit(1);
}

async function sendTest() {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Test email from Auth App",
      text: "This is a test email sent from the local test-send-email.js script.",
    });
    console.log("✅ Test email sent:", info.response || info);
  } catch (err) {
    console.error("❌ Send test email error:", err);
    process.exitCode = 1;
  }
}

sendTest();
