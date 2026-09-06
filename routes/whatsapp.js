const express = require('express');
const router = express.Router();
const { sendWhatsappMessage } = require('../services/whatsapp');
const Order = require('../models/Order');

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body || '';

  if (text.toLowerCase().includes('order')) {
    const order = await Order.create({
      orderNumber: 'GK-' + Math.floor(1000 + Math.random() * 9000),
      items: [],
      subtotal: 0, deliveryFee: 25, total: 25,
      source: 'whatsapp',
      status: 'placed'
    });
    await sendWhatsappMessage(from,
      `Thanks! We've received your order ${order.orderNumber}. Our team will confirm the total and delivery time shortly. 🌶️`
    );
  }
});

module.exports = router;
