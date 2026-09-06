const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const Order = require('../models/Order');
const { requireAuth } = require('./auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/create-order', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const rzpOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: 'INR',
      receipt: order.orderNumber
    });

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json({ razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify', requireAuth, async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  const order = await Order.findOneAndUpdate(
    { razorpayOrderId },
    { paymentStatus: 'paid', razorpayPaymentId, status: 'preparing' },
    { new: true }
  );

  res.json({ verified: true, order });
});

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature !== expected) return res.status(400).send('Invalid webhook signature');

  const event = JSON.parse(req.body);
  if (event.event === 'payment.captured') {
    const razorpayOrderId = event.payload.payment.entity.order_id;
    await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: 'paid', status: 'preparing' });
  }

  res.json({ received: true });
});

module.exports = router;
