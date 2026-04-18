const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    let userId = req.user?.id || req.body.userId; // Support auth or raw bypass
    
    if(!userId) userId = '60d0fe4f5311236168a109ca'; // Mock fallback for testing without auth token

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      orderStatus: 'Pending'
    });

    const order = await newOrder.save();

    // Decrease Stock
    for (const p of products) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { stock: -p.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: { orderStatus: status } }, { new: true });
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Order removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
