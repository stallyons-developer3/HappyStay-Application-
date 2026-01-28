import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Screens, Colors } from '../constants/Constants';

// Navigators
import BottomTabNavigator from './BottomTabNavigator';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import Onboarding1Screen from '../screens/onboarding/Onboarding1Screen';
import Onboarding2Screen from '../screens/onboarding/Onboarding2Screen';
import Onboarding3Screen from '../screens/onboarding/Onboarding3Screen';
import ActivityDetailScreen from '../screens/main/ActivityDetailScreen';
import CreateHangoutScreen from '../screens/main/CreateHangoutScreen';
import HangoutDetailScreen from '../screens/main/HangoutDetailScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import TripScreen from '../screens/main/TripScreen';
import PropertyDetailScreen from '../screens/main/PropertyDetailScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={Screens.Splash}
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          {/* Auth Screens */}
          <Stack.Screen name={Screens.Splash} component={SplashScreen} />
          <Stack.Screen name={Screens.Welcome} component={WelcomeScreen} />
          <Stack.Screen name={Screens.Login} component={LoginScreen} />
          <Stack.Screen name={Screens.Register} component={RegisterScreen} />
          <Stack.Screen name={Screens.ForgotPassword} component={ForgotPasswordScreen} />

          {/* Onboarding Screens */}
          <Stack.Screen
            name={Screens.Onboarding1}
            component={Onboarding1Screen}
          />
          <Stack.Screen
            name={Screens.Onboarding2}
            component={Onboarding2Screen}
          />
          <Stack.Screen
            name={Screens.Onboarding3}
            component={Onboarding3Screen}
          />

          {/* Main App - Bottom Tabs */}
          <Stack.Screen name={Screens.MainApp} component={BottomTabNavigator} />

          {/* Detail Screens */}
          <Stack.Screen
            name={Screens.ActivityDetail}
            component={ActivityDetailScreen}
          />
          <Stack.Screen
            name={Screens.HangoutDetail}
            component={HangoutDetailScreen}
          />
          <Stack.Screen
            name={Screens.ChatDetail}
            component={ChatDetailScreen}
          />
          <Stack.Screen name={Screens.Profile} component={ProfileScreen} />
          <Stack.Screen
            name={Screens.EditProfile}
            component={EditProfileScreen}
          />
          <Stack.Screen name={Screens.Trip} component={TripScreen} />
          <Stack.Screen
            name={Screens.PropertyDetail}
            component={PropertyDetailScreen}
          />

          {/* Create Screens */}
          <Stack.Screen
            name={Screens.CreateHangout}
            component={CreateHangoutScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
