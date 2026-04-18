const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// Admin middleware to verify role
const adminAuth = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach(o => {
      if (o.paymentStatus === 'Completed') totalRevenue += o.totalAmount;
    });

    const usersCount = await User.countDocuments({ role: 'user' });
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } }); // Threshold = 5

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      usersCount,
      lowStockCount
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/customers', auth, adminAuth, async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' }).select('-password');
    res.json(customers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.put('/stock/:id', auth, adminAuth, async (req, res) => {
  try {
    const { stock } = req.body;
    let product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/low-stock', auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 5 } });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
