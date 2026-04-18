const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/create', auth, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const newOrder = new Order({
      userId: req.user.id,
      products,
      totalAmount
    });
    const order = await newOrder.save();

    // Loyalty Points (1 point per 100 LKR)
    const pointsEarned = Math.floor(totalAmount / 100);
    await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: pointsEarned } });

    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', ['name', 'email']).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
