import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  language: 'en', // 'en' or 'ta'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateProfileSettings: (state, action) => {
      if (state.user) state.user.bodyProfile = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload; // 'en' or 'ta'
    }
  },
});

export const { loginSuccess, logout, updateProfileSettings, setLanguage } = authSlice.actions;
export default authSlice.reducer;
