import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const { width } = Dimensions.get('window');

const tabs = [
  {
    name: 'Home',
    icon: require('../assets/images/icons/home.png'),
    iconActive: require('../assets/images/icons/home-active.png'),
  },
  {
    name: 'Activities',
    icon: require('../assets/images/icons/activities.png'),
    iconActive: require('../assets/images/icons/activities-active.png'),
  },
  {
    name: 'Hangouts',
    icon: require('../assets/images/icons/hangouts.png'),
    iconActive: require('../assets/images/icons/hangouts-active.png'),
  },
  {
    name: 'Chat',
    icon: require('../assets/images/icons/chat.png'),
    iconActive: require('../assets/images/icons/chat-active.png'),
  },
  {
    name: 'Manage',
    icon: require('../assets/images/icons/manage.png'),
    iconActive: require('../assets/images/icons/manage-active.png'),
  },
];

const BottomNav = ({ activeTab = 'Home', onTabPress, chatBadgeCount = 0 }) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.name;
        const showBadge = tab.name === 'Chat' && chatBadgeCount > 0;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress && onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Image
                source={isActive ? tab.iconActive : tab.icon}
                style={[
                  styles.icon,
                  { tintColor: isActive ? Colors.primary : Colors.textLight },
                ]}
                resizeMode="contain"
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {chatBadgeCount > 9 ? '9+' : chatBadgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? Colors.primary : Colors.textLight },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
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
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 10,
    color: Colors.white,
  },
  label: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 11,
  },
});

export default BottomNav;
