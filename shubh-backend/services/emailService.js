'use strict';

const nodemailer = require('nodemailer');

/**
 * Lazy-initialised transporter — only created when first email is sent.
 * Falls back to console logging in development if EMAIL_USER is not set.
 */
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send a generic email.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }

  const mailOptions = {
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  };

  const info = await getTransporter().sendMail(mailOptions);
  return info;
};

/**
 * Send contact form notification to admin.
 */
const sendContactNotification = async ({ name, email, subject, message }) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#8B0000">New Contact Message</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Subject:</td><td style="padding:8px">${subject}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:4px">
        <p style="white-space:pre-wrap">${message}</p>
      </div>
    </div>`;

  return sendEmail({
    to: process.env.EMAIL_USER,
    subject: `[Portfolio] Contact: ${subject}`,
    html,
  });
};

/**
 * Send newsletter confirmation email.
 */
const sendNewsletterConfirm = async ({ email, name, confirmUrl }) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#8B0000">Confirm your subscription</h2>
      <p>Hey ${name || 'there'},</p>
      <p>Click below to confirm your newsletter subscription:</p>
      <a href="${confirmUrl}" style="display:inline-block;padding:12px 24px;background:#8B0000;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0">
        Confirm Subscription
      </a>
      <p style="color:#888;font-size:12px">This link expires in 24 hours. If you didn't subscribe, ignore this email.</p>
    </div>`;

  return sendEmail({ to: email, subject: 'Confirm your subscription — Shubh Jaiswal', html });
};

module.exports = { sendEmail, sendContactNotification, sendNewsletterConfirm };
