import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Image } from 'react-native';
import api from '../../api/axiosInstance';
import { ACTIVITY, HANGOUT, POST } from '../../api/endpoints';

const prefetchImages = (activities, hangouts, posts) => {
  const urls = [];
  activities.forEach(a => {
    if (a.thumbnail) urls.push(a.thumbnail);
  });
  hangouts.forEach(h => {
    if (h.user?.profile_picture) urls.push(h.user.profile_picture);
  });
  posts.forEach(p => {
    if (p.thumbnail) urls.push(p.thumbnail);
    if (p.property_icon) urls.push(p.property_icon);
  });
  urls.forEach(url => {
    Image.prefetch(url).catch(() => {});
  });
};

export const fetchHomeData = createAsyncThunk(
  'home/fetchHomeData',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });
      const qs = queryParams.toString();
      const suffix = qs ? `?${qs}` : '';

      const [activitiesRes, hangoutsRes, postsRes] = await Promise.all([
        api.get(`${ACTIVITY.GET_ALL}${suffix}`),
        api.get(`${HANGOUT.GET_ALL}${suffix}`),
        api.get(POST.GET_ALL),
      ]);

      const activities = activitiesRes.data?.activities || [];
      const hangouts = hangoutsRes.data?.hangouts || [];
      const posts = postsRes.data?.posts || [];

      // Prefetch feed images so they load faster
      prefetchImages(activities, hangouts, posts);

      return { activities, hangouts, posts };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load home data',
      );
    }
  },
);

const initialState = {
  activities: [],
  hangouts: [],
  posts: [],
  isLoading: false,
  error: null,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHomeData.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload.activities;
        state.hangouts = action.payload.hangouts;
        state.posts = action.payload.posts;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default homeSlice.reducer;
