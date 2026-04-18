const express = require('express');
const { addReview, getReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const router = express.Router();

router.post('/', addReview);
router.get('/:productId', getReviews);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
