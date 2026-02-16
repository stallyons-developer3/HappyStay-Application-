import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID =
  '213488855892-l90s1cgdpkuedooav94882brm7bhe8cp.apps.googleusercontent.com';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    const userInfo = response.data || response;
    const user = userInfo.user || userInfo;

    return {
      google_id: user.id,
      email: user.email,
      name: user.name || user.givenName,
      photo: user.photo || null,
    };
  } catch (error) {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
      return null;
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services is not available on this device.');
    }
    throw new Error(
      error?.message || 'Google Sign-In failed. Please try again.',
    );
  }
};

export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.log('Google Sign-Out Error:', error);
  }
};
