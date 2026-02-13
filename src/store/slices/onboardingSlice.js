import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  first_name: '',
  last_name: '',
  username: '',
  gender: '',
  nationality: '',
  age: '',
  trip_interests: [],
  profile_picture: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingData: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetOnboarding: () => initialState,
  },
});

export const { setOnboardingData, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
