import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// Async thunks
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/wishlist/${userId}`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.msg || 'Failed'); }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async ({ userId, productId }, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/add', { userId, productId });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data?.msg || 'Failed'); }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async ({ userId, productId }, { rejectWithValue }) => {
  try {
    await api.delete(`/wishlist/remove/${userId}/${productId}`);
    return productId;
  } catch (e) { return rejectWithValue(e.response?.data?.msg || 'Failed'); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearWishlist: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state)         => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToWishlist.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(i => (i.productId?._id || i.productId) !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
