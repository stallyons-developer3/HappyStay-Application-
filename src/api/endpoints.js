export const BASE_URL =
  'https://sty1.devmail-sty.online/HappyStay-2/public/api';
export const STORAGE_URL = 'https://sty1.devmail-sty.online/HappyStay-2/public';

export const AUTH = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  LOGOUT: '/logout',
  GOOGLE_LOGIN: '/google-login',
};

export const PROFILE = {
  GET_PROFILE: '/profile',
  SETUP_PROFILE: '/profile/setup',
  UPDATE_PROFILE: '/profile/update',
};

export const PROPERTY = {
  GET_ALL: '/properties',
  GET_DETAIL: id => `/properties/${id}`,
  BOOK: id => `/properties/${id}/book`,
  MY_TRIPS: '/my-trips',
};

export const ACTIVITY = {
  GET_ALL: '/activities',
  GET_DETAIL: id => `/activities/${id}`,
  SEND_REQUEST: id => `/activities/${id}/request`,
  GET_COMMENTS: id => `/activities/${id}/comments`,
  ADD_COMMENT: id => `/activities/${id}/comment`,
  GET_CHAT: id => `/activities/${id}/chat`,
  SEND_CHAT: id => `/activities/${id}/chat`,
};

export const HANGOUT = {
  GET_ALL: '/hangouts',
  CREATE: '/hangouts',
  GET_DETAIL: id => `/hangouts/${id}`,
  UPDATE: id => `/hangouts/${id}/update`,
  DELETE: id => `/hangouts/${id}`,
  SEND_REQUEST: id => `/hangouts/${id}/request`,
  GET_COMMENTS: id => `/hangouts/${id}/comments`,
  ADD_COMMENT: id => `/hangouts/${id}/comment`,
  GET_CHAT: id => `/hangouts/${id}/chat`,
  SEND_CHAT: id => `/hangouts/${id}/chat`,
  GET_REQUESTS: id => `/hangouts/${id}/requests`,
  RESPOND_REQUEST: requestId => `/hangout-requests/${requestId}/respond`,
};

export const CHAT = {
  MY_GROUPS: '/my-chat-groups',
};

export const SUPPORT = {
  GET_MESSAGES: '/support/messages',
  SEND_MESSAGE: '/support/send',
  UNREAD_COUNT: '/support/unread-count',
};

export const NOTIFICATION = {
  GET_ALL: '/notifications',
  READ_ALL: '/notifications/read-all',
  READ_SINGLE: id => `/notifications/${id}/read`,
};

export const POST = {
  GET_ALL: '/posts',
  GET_DETAIL: id => `/posts/${id}`,
};
