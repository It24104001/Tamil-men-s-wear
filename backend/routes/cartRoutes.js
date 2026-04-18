const express = require('express');
const { addToCart, getCart, updateCart, removeFromCart } = require('../controllers/cartController');
const router = express.Router();

router.post('/add', addToCart);
router.get('/:userId', getCart);
router.put('/update', updateCart);
router.delete('/remove/:userId/:productId', removeFromCart);

module.exports = router;
