const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for Google Auth users
  googleId: { type: String },
  phone: { type: String },
  address: { type: String },
  loyaltyPoints: { type: Number, default: 0 },
  bodyProfile: {
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    age: { type: Number }
  },
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    size: { type: String }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

module.exports = mongoose.model('User', userSchema);
