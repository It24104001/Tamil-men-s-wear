const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/products'); // legacy mapped to controller
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');

const authRoutes = require('./routes/auth'); // Legacy login routes
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

// 6 Required Components for Rubric
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/reviews', reviewRoutes);
app.use('/cart', cartRoutes);

// Legacy App Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Dual support for mobile app
app.use('/api/orders', orderRoutes);    // Dual support for mobile app
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
