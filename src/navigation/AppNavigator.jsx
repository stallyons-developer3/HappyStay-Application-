import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screens, Colors } from '../constants/Constants';
import { BadgeProvider } from '../context/BadgeContext';
import { ToastProvider } from '../context/ToastContext';

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
import LocationMapScreen from '../screens/main/LocationMapScreen';
import JoinedScreen from '../screens/main/JoinedScreen';

const Stack = createNativeStackNavigator();

const withSafeArea = (WrappedComponent, edges = ['bottom']) => {
  return props => (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={edges}
    >
      <WrappedComponent {...props} />
    </SafeAreaView>
  );
};

const AppNavigator = () => {
  return (
    <ToastProvider>
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
            component={withSafeArea(SplashScreen)}
          />
          <Stack.Screen
            name={Screens.Welcome}
            component={withSafeArea(WelcomeScreen)}
          />
          <Stack.Screen
            name={Screens.Login}
            component={withSafeArea(LoginScreen)}
          />
          <Stack.Screen
            name={Screens.Register}
            component={withSafeArea(RegisterScreen)}
          />
          <Stack.Screen
            name={Screens.ForgotPassword}
            component={withSafeArea(ForgotPasswordScreen)}
          />
          <Stack.Screen
            name={Screens.ResetPassword}
            component={withSafeArea(ResetPasswordScreen)}
          />

          <Stack.Screen
            name={Screens.Onboarding1}
            component={withSafeArea(Onboarding1Screen)}
          />
          <Stack.Screen
            name={Screens.Onboarding2}
            component={withSafeArea(Onboarding2Screen)}
          />
          <Stack.Screen
            name={Screens.Onboarding3}
            component={withSafeArea(Onboarding3Screen)}
          />
          <Stack.Screen
            name={'Onboarding4'}
            component={withSafeArea(Onboarding4Screen)}
          />

          <Stack.Screen name={Screens.MainApp} component={withSafeArea(BottomTabNavigator)} />

          <Stack.Screen
            name={Screens.ActivityDetail}
            component={withSafeArea(ActivityDetailScreen)}
          />
          <Stack.Screen
            name={Screens.HangoutDetail}
            component={withSafeArea(HangoutDetailScreen)}
          />
          <Stack.Screen
            name={Screens.ChatDetail}
            component={withSafeArea(ChatDetailScreen)}
          />
          <Stack.Screen
            name={Screens.Profile}
            component={withSafeArea(ProfileScreen)}
          />
          <Stack.Screen
            name={Screens.EditProfile}
            component={withSafeArea(EditProfileScreen)}
          />
          <Stack.Screen
            name={Screens.Trip}
            component={withSafeArea(TripScreen)}
          />
          <Stack.Screen
            name={Screens.PropertyDetail}
            component={withSafeArea(PropertyDetailScreen)}
          />
          <Stack.Screen
            name={Screens.CreateHangout}
            component={withSafeArea(CreateHangoutScreen)}
          />
          <Stack.Screen
            name={Screens.Notification}
            component={withSafeArea(NotificationScreen)}
          />
          <Stack.Screen
            name={Screens.Map}
            component={withSafeArea(MapScreen)}
          />
          <Stack.Screen
            name={Screens.LocationMap}
            component={withSafeArea(LocationMapScreen)}
          />
          <Stack.Screen
            name={Screens.Joined}
            component={withSafeArea(JoinedScreen)}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </BadgeProvider>
    </ToastProvider>
  );
};

export default AppNavigator;
