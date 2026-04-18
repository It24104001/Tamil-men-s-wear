const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { occasion } = req.query; // 'formal', 'casual', 'festival'
    if (occasion) {
      const products = await Product.find({ category: occasion });
      return res.json(products);
    }
    const products = await Product.find().limit(5); // fallback
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
