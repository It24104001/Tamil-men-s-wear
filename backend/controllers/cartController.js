const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if(!userId || !productId) return res.status(400).json({msg: 'Missing fields'});
    
    let item = await Cart.findOne({ userId, productId });
    if(item) {
      item.quantity += (quantity || 1);
      await item.save();
    } else {
      item = new Cart({ userId, productId, quantity });
      await item.save();
    }
    res.status(201).json(item);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId }).populate('productId');
    res.json(cart);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const item = await Cart.findOneAndUpdate({ userId, productId }, { quantity }, {new: true});
    if(!item) return res.status(404).json({msg: 'Item not found in cart'});
    res.json(item);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const item = await Cart.findOneAndDelete({ userId, productId });
    if(!item) return res.status(404).json({msg: 'Not found'});
    res.json({msg: 'Removed successfully'});
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};
