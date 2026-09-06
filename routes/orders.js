const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { requireAuth } = require('./auth');

router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, source } = req.body;
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryFee = 25;
    const total = subtotal + deliveryFee + Math.round(subtotal * 0.05);

    const order = await Order.create({
      orderNumber: 'GK-' + Math.floor(1000 + Math.random() * 9000),
      user: req.user.id,
      items,
      subtotal,
      deliveryFee,
      total,
      source: source || 'app',
      deliveryAddress
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', requireAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/', requireAuth, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  res.json(orders);
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status, deliveryPartner } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(deliveryPartner && { deliveryPartner }) },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const io = req.app.get('io');
  io.to(`order:${order._id}`).emit('order:status', { orderId: order._id, status: order.status });

  res.json(order);
});

module.exports = router;
