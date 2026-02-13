import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import { AUTH, PROFILE } from '../../api/endpoints';
import {
  saveToken,
  removeToken,
  saveUserData,
  removeUserData,
  getToken,
} from '../../utils/storage';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(AUTH.LOGIN, credentials);
      const { token, user } = response.data;
      await saveToken(token);
      await saveUserData(user);
      return { token, user };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
      return rejectWithValue(message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(AUTH.REGISTER, userData);
      const { token, user } = response.data;
      await saveToken(token);
      await saveUserData(user);
      return { token, user };
    } catch (error) {
      const message =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post(AUTH.LOGOUT);
      await removeToken();
      await removeUserData();
      return true;
    } catch (error) {
      await removeToken();
      await removeUserData();
      return rejectWithValue('Logout failed but local data cleared');
    }
  },
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      if (!token) return rejectWithValue('No token found');

      const response = await api.get(PROFILE.GET_PROFILE);
      const user = response.data.user;
      await saveUserData(user);
      return { token, user };
    } catch (error) {
      await removeToken();
      await removeUserData();
      return rejectWithValue('Session expired');
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })

      // Register
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, state => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Check Auth
      .addCase(checkAuth.pending, state => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, state => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
