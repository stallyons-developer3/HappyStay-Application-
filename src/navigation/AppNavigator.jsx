import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screens, Colors } from '../constants/Constants';
import { BadgeProvider } from '../context/BadgeContext';

import BottomTabNavigator from './BottomTabNavigator';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import Onboarding1Screen from '../screens/onboarding/Onboarding1Screen';
import Onboarding2Screen from '../screens/onboarding/Onboarding2Screen';
import Onboarding3Screen from '../screens/onboarding/Onboarding3Screen';
import Onboarding4Screen from '../screens/onboarding/Onboarding4Screen';
import ActivityDetailScreen from '../screens/main/ActivityDetailScreen';
import CreateHangoutScreen from '../screens/main/CreateHangoutScreen';
import HangoutDetailScreen from '../screens/main/HangoutDetailScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import TripScreen from '../screens/main/TripScreen';
import PropertyDetailScreen from '../screens/main/PropertyDetailScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import MapScreen from '../screens/main/MapScreen';

const Stack = createNativeStackNavigator();

const withSafeArea = (WrappedComponent, edges = ['top']) => {
  return props => (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.primary }}
      edges={edges}
    >
      <WrappedComponent {...props} />
    </SafeAreaView>
  );
};

const AppNavigator = () => {
  return (
    <BadgeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={Screens.Splash}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: Colors.backgroundGray },
          }}
        >
          <Stack.Screen
            name={Screens.Splash}
            component={withSafeArea(SplashScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Welcome}
            component={withSafeArea(WelcomeScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Login}
            component={withSafeArea(LoginScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Register}
            component={withSafeArea(RegisterScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.ForgotPassword}
            component={withSafeArea(ForgotPasswordScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.ResetPassword}
            component={withSafeArea(ResetPasswordScreen, ['top', 'bottom'])}
          />

          <Stack.Screen
            name={Screens.Onboarding1}
            component={withSafeArea(Onboarding1Screen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Onboarding2}
            component={withSafeArea(Onboarding2Screen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Onboarding3}
            component={withSafeArea(Onboarding3Screen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={'Onboarding4'}
            component={withSafeArea(Onboarding4Screen, ['top', 'bottom'])}
          />

          <Stack.Screen name={Screens.MainApp} component={BottomTabNavigator} />

          <Stack.Screen
            name={Screens.ActivityDetail}
            component={withSafeArea(ActivityDetailScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.HangoutDetail}
            component={withSafeArea(HangoutDetailScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.ChatDetail}
            component={withSafeArea(ChatDetailScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Profile}
            component={withSafeArea(ProfileScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.EditProfile}
            component={withSafeArea(EditProfileScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Trip}
            component={withSafeArea(TripScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.PropertyDetail}
            component={withSafeArea(PropertyDetailScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.CreateHangout}
            component={withSafeArea(CreateHangoutScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Notification}
            component={withSafeArea(NotificationScreen, ['top', 'bottom'])}
          />
          <Stack.Screen
            name={Screens.Map}
            component={withSafeArea(MapScreen, ['top', 'bottom'])}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </BadgeProvider>
  );
};

export default AppNavigator;
