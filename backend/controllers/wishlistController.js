const Wishlist = require('../models/Wishlist');

exports.addWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if(!userId || !productId) return res.status(400).json({msg: 'Missing required fields'});
    const existing = await Wishlist.findOne({ userId, productId });
    if(existing) return res.status(400).json({msg: 'Already in wishlist'});
    
    const item = new Wishlist({ userId, productId });
    await item.save();
    res.status(201).json(item);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const list = await Wishlist.find({ userId: req.params.userId }).populate('productId');
    res.json(list);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.removeWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const item = await Wishlist.findOneAndDelete({ userId, productId });
    if(!item) return res.status(404).json({msg: 'Not found'});
    res.json({msg: 'Removed successfully'});
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};
