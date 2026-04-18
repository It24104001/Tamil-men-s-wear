const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., 'shirts', 'pants', 'accessories', 'formal', 'casual', 'festival'
  sizeAvailable: [{ type: String }], // e.g., 'S', 'M', 'L', 'XL'
  stock: { type: Number, required: true },
  images: [{ type: String }],
  description: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
