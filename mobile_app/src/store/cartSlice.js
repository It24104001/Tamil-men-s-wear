import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i._id === item._id && i.selectedSize === item.selectedSize);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      state.total += item.price;
    },
    removeFromCart: (state, action) => {
      const index = state.items.findIndex(i => i._id === action.payload._id && i.selectedSize === action.payload.selectedSize);
      if (index >= 0) {
        state.total -= state.items[index].price * state.items[index].quantity;
        state.items.splice(index, 1);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    updateQuantity: (state, action) => {
      const { _id, selectedSize, quantity } = action.payload;
      const item = state.items.find(i => i._id === _id && i.selectedSize === selectedSize);
      if (item) {
        const diff = quantity - item.quantity;
        item.quantity = quantity;
        state.total += item.price * diff;
        if (state.total < 0) state.total = 0;
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
