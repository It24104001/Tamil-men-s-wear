import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './authSlice';
import cartReducer     from './cartSlice';
import themeReducer    from './themeSlice';
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    cart:     cartReducer,
    theme:    themeReducer,
    wishlist: wishlistReducer,
  },
});
