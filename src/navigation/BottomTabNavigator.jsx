import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Screens } from '../constants/Constants';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ActivitiesScreen from '../screens/main/ActivitiesScreen';
import HangoutsScreen from '../screens/main/HangoutsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ManageScreen from '../screens/main/ManageScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: Colors.backgroundGray,
          borderRadius: 50,
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors.white,
          height: 65 + insets.bottom,
          paddingBottom: 10 + insets.bottom,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          borderTopEndRadius: 35,
          borderTopStartRadius: 35,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.poppinsMedium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
      }}
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/icons/home.png')}
              style={[
                styles.icon,
                { tintColor: focused ? Colors.primary : Colors.textLight },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Activities Tab */}
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/icons/activities.png')}
              style={[
                styles.icon,
                { tintColor: focused ? Colors.primary : Colors.textLight },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Hangouts Tab */}
      <Tab.Screen
        name="Hangouts"
        component={HangoutsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/icons/hangouts.png')}
              style={[
                styles.icon,
                { tintColor: focused ? Colors.primary : Colors.textLight },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      {/* Chat Tab with Badge */}
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/icons/chat.png')}
                style={[
                  styles.icon,
                  { tintColor: focused ? Colors.primary : Colors.textLight },
                ]}
                resizeMode="contain"
              />
              {/* Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </View>
          ),
        }}
      />

      {/* Manage Tab */}
      <Tab.Screen
        name="Manage"
        component={ManageScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../assets/images/icons/manage.png')}
              style={[
                styles.icon,
                { tintColor: focused ? Colors.primary : Colors.textLight },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: Colors.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 10,
    color: Colors.white,
  },
});

export default BottomTabNavigator;
