const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    if(!userId || !productId || !rating) return res.status(400).json({msg: 'Missing required fields'});
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.json(reviews);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if(!review) return res.status(404).json({msg: 'Not found'});
    res.json(review);
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if(!review) return res.status(404).json({msg: 'Not found'});
    res.json({msg: 'Deleted successfully'});
  } catch(err) {
    res.status(500).json({msg: err.message});
  }
};
