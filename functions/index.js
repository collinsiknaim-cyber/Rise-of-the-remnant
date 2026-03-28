const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const smtpUser = functions.config().smtp.user;
const smtpPass = functions.config().smtp.pass;
const smtpHost = functions.config().smtp.host || 'smtp.gmail.com';
const smtpPort = parseInt(functions.config().smtp.port, 10) || 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

exports.sendEmail = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { to_email, subject, body } = req.body;
  if (!to_email || !subject || !body) {
    return res.status(400).send('Missing required fields');
  }

  if (!smtpUser || !smtpPass) {
    return res.status(500).send('SMTP credentials are not configured.');
  }

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: to_email,
      subject,
      text: body,
    });
    return res.status(200).send('Email sent');
  } catch (error) {
    console.error('sendEmail error', error);
    return res.status(500).send(`Email send failed: ${error.message}`);
  }
});
