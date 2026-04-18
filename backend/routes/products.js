const express = require('express');
const auth = require('../middleware/auth');
const { getProducts, createProduct, updateProduct, deleteProduct, getRecommendations } = require('../controllers/productController');
const router = express.Router();

router.get('/', getProducts);
router.post('/', auth, createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.get('/recommendations', auth, getRecommendations);

module.exports = router;
