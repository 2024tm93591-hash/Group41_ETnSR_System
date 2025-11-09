const express = require('express');
const nodemailer = require('nodemailer');
const promClient = require('prom-client');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// ==============================
// 🔹 Prometheus Metrics
// ==============================
const emailSentCounter = new promClient.Counter({
  name: 'emails_sent_total',
  help: 'Total number of emails sent',
});

const smsSentCounter = new promClient.Counter({
  name: 'sms_sent_total',
  help: 'Total number of SMS messages sent',
});

const eticketSentCounter = new promClient.Counter({
  name: 'etickets_sent_total',
  help: 'Total number of e-ticket emails sent',
});

// ==============================
// 🔹 Correlation ID Middleware
// ==============================
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('X-Correlation-ID', req.correlationId);
  console.log(`[${req.correlationId}] ${req.method} ${req.url}`);
  next();
});

// ==============================
// 🔹 Email Transporter (Mock)
// ==============================
// In production, replace smtp.example.com with a real SMTP host.
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com',  // replace with actual email
    pass: 'your-email-password',     // replace with actual password
  },
});

// ==============================
// 🔹 Endpoints
// ==============================

// --- Email Notification ---
app.post('/v1/notifications/email', async (req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text)
    return res.status(400).json({ error: 'Invalid request payload' });

  try {
    const info = await transporter.sendMail({
      from: '"Event Ticketing" <no-reply@example.com>',
      to,
      subject,
      text,
    });

    emailSentCounter.inc();
    console.log(`[${req.correlationId}] Email sent to ${to}`);
    res.json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error(`[${req.correlationId}] Error sending email:`, error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// --- SMS Notification (Mock) ---
app.post('/v1/notifications/sms', (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message)
    return res.status(400).json({ error: 'Invalid request payload' });

  smsSentCounter.inc();
  console.log(`[${req.correlationId}] SMS sent to ${phone}: ${message}`);
  res.json({ message: 'SMS sent successfully' });
});

// --- E-Ticket Notification (Email with attachment or link) ---
app.post('/v1/notifications/e-ticket', async (req, res) => {
  const { to, subject, text, attachmentUrl } = req.body;
  if (!to || !subject || !text)
    return res.status(400).json({ error: 'Invalid request payload' });

  try {
    const mailOptions = {
      from: '"Event Ticketing" <no-reply@example.com>',
      to,
      subject,
      text,
    };

    if (attachmentUrl) {
      mailOptions.attachments = [{ path: attachmentUrl }];
    }

    const info = await transporter.sendMail(mailOptions);
    eticketSentCounter.inc();

    console.log(`[${req.correlationId}] E-ticket sent to ${to}`);
    res.json({ message: 'E-ticket sent successfully', info });
  } catch (error) {
    console.error(`[${req.correlationId}] Error sending e-ticket:`, error);
    res.status(500).json({ error: 'Failed to send e-ticket' });
  }
});

// --- Prometheus Metrics Endpoint ---
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// ==============================
// 🔹 Start Server
// ==============================
const PORT = 3005;
app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
