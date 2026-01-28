import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, Fonts } from '../constants/Constants';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ActivitiesScreen from '../screens/main/ActivitiesScreen';
import HangoutsScreen from '../screens/main/HangoutsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ManageScreen from '../screens/main/ManageScreen';

const Tab = createBottomTabNavigator();

// Tab Icons
const tabIcons = {
  Home: {
    active: require('../assets/images/icons/home-active.png'),
    inactive: require('../assets/images/icons/home.png'),
  },
  Activities: {
    active: require('../assets/images/icons/activities-active.png'),
    inactive: require('../assets/images/icons/activities.png'),
  },
  Hangouts: {
    active: require('../assets/images/icons/hangouts-active.png'),
    inactive: require('../assets/images/icons/hangouts.png'),
  },
  Chat: {
    active: require('../assets/images/icons/chat-active.png'),
    inactive: require('../assets/images/icons/chat.png'),
  },
  Manage: {
    active: require('../assets/images/icons/manage-active.png'),
    inactive: require('../assets/images/icons/manage.png'),
  },
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconContainer}>
            <Image
              source={
                focused
                  ? tabIcons[route.name].active
                  : tabIcons[route.name].inactive
              }
              style={[
                styles.icon,
                { tintColor: focused ? Colors.primary : Colors.textLight },
              ]}
              resizeMode="contain"
            />
            {route.name === 'Chat' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            )}
          </View>
        ),
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.label,
              { color: focused ? Colors.primary : Colors.textLight },
            ]}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activities" component={ActivitiesScreen} />
      <Tab.Screen name="Hangouts" component={HangoutsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Manage" component={ManageScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    paddingBottom: 8,
    height: 65,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    width: 24,
    height: 24,
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
  label: {
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 11,
  },
});

export default BottomTabNavigator;
