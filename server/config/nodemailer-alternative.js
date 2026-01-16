import nodemailer from 'nodemailer';

// Alternative configuration for Gmail (if Brevo fails)
const alternativeTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-gmail@gmail.com',
        pass: 'your-app-password' // Use app password, not regular password
    }
});

// Alternative configuration for Outlook
const outlookTransporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: 'your-email@outlook.com',
        pass: 'your-password'
    }
});

// Test different SMTP providers
export { alternativeTransporter, outlookTransporter };
