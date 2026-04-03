export const Colors = {
  primary: '#26B16D',
  primaryLight: '#E8F8F0',

  white: '#FFFFFF',
  background: '#F9F9F9',
  backgroundGray: '#F5F5F5',

  textBlack: '#000000',
  textDark: '#333333',
  textGray: '#6C6C6C',
  textLight: '#BFBFBF',

  transparent: 'transparent',
  red: '#FF3B30',

  border: '#E8E8E8',
  borderLight: '#F0F0F0',

  shadow: '#000000',
};

export const Fonts = {
  poppinsRegular: 'Poppins-Regular',
  poppinsMedium: 'Poppins-Medium',
  poppinsSemiBold: 'Poppins-SemiBold',
  poppinsBold: 'Poppins-Bold',

  RobotoRegular: 'Roboto-Regular',
  RobotoMedium: 'Roboto-Medium',
  RobotoBold: 'Roboto-Bold',
};

export const Screens = {
  Splash: 'Splash',
  Welcome: 'Welcome',
  Login: 'Login',
  Register: 'Register',
  ForgotPassword: 'ForgotPassword',
  ResetPassword: 'ResetPassword',
  Onboarding1: 'Onboarding1',
  Onboarding2: 'Onboarding2',
  Onboarding3: 'Onboarding3',
  Onboarding4: 'Onboarding4',

  MainApp: 'MainApp',

  Home: 'Home',
  Activities: 'Activities',
  Hangouts: 'Hangouts',
  Chat: 'Chat',
  Manage: 'Manage',

  ActivityDetail: 'ActivityDetail',
  HangoutDetail: 'HangoutDetail',
  ChatDetail: 'ChatDetail',
  Profile: 'Profile',
  EditProfile: 'EditProfile',
  Trip: 'Trip',
  PropertyDetail: 'PropertyDetail',

  CreateHangout: 'CreateHangout',
  Joined: 'Joined',

  Notification: 'Notification',
  Map: 'Map',
  LocationMap: 'LocationMap',
};

// Imported from gitignored env.js — never hardcode secrets here
export { ENV as ENV_KEYS } from './env';
export const GOOGLE_MAPS_API_KEY = require('./env').ENV.GOOGLE_MAPS_API_KEY;

export default Colors;
