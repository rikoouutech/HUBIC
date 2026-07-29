const nodemailer = require('nodemailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fields we never want to leak into the email body.
const IGNORED_FIELDS = new Set(['website', 'form_source', 'honeypot']);

const FIELD_LABELS = {
  name: 'Name',
  email: 'Email',
  company: 'Company',
  phone: 'Phone',
  message: 'Message',
  request_demo: 'Requested Demo',
  title: 'Title / Role',
  company_size: 'Company Size',
  workflow: 'Most Time-Consuming Workflow',
  enquiry_type: 'Enquiry Type',
};

function buildEmailBody(fields, formSource) {
  const lines = [`Form: ${formSource || 'unknown'}`, ''];
  for (const [key, value] of Object.entries(fields)) {
    if (IGNORED_FIELDS.has(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    const label = FIELD_LABELS[key] || key;
    lines.push(`${label}: ${value}`);
  }
  return lines.join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Honeypot: bots tend to fill every field. If this hidden field has a
  // value, pretend success so we don't tip the bot off, but skip sending.
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  const formSource = typeof body.form_source === 'string' ? body.form_source : 'unknown';
  const toEmail = process.env.TO_EMAIL || 'nathan@infomoksha.com';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_LOGIN,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const text = buildEmailBody(body, formSource);
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_LOGIN;

  try {
    await transporter.sendMail({
      from: `"HUBIC Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New HUBIC enquiry from ${name}`,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to send enquiry email:', err);
    return res.status(500).json({ ok: false, error: 'Failed to send your message. Please try again later.' });
  }
};
