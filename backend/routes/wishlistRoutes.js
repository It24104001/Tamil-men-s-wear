const express = require('express');
const { addWishlist, getWishlist, removeWishlist } = require('../controllers/wishlistController');
const router = express.Router();

router.post('/add', addWishlist);
router.get('/:userId', getWishlist);
router.delete('/remove/:userId/:productId', removeWishlist);

module.exports = router;
