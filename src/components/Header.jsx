import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const Header = ({
  title = '',
  greeting = '',
  showGreeting = false,
  showProfile = true,
  showNotification = true,
  showBackIcon = false,
  notificationCount = 0,
  profileImage,
  onProfilePress,
  onNotificationPress,
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Row - Profile, Title, Notification */}
      <View style={styles.topRow}>
        {/* Left - Profile & Title */}
        <View style={styles.leftSection}>
          {showProfile && (
            <TouchableOpacity
              onPress={onProfilePress}
              activeOpacity={0.8}
              style={styles.profileContainer}
            >
              <Image
                source={profileImage || require('../assets/images/profile.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>

        {/* Right - Notification */}
        {showNotification && (
          <TouchableOpacity
            onPress={onNotificationPress}
            activeOpacity={0.8}
            style={styles.notificationContainer}
          >
            <View style={styles.notificationIconWrapper}>
              <Image
                source={require('../assets/images/icons/notification.png')}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </View>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
      {showBackIcon && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/images/arrow-left.png')}
            style={styles.backicon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {/* Greeting Text */}
      {showGreeting && greeting ? (
        <Text style={styles.greeting}>{greeting}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.white,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 10,
    color: Colors.white,
  },
  greeting: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: Colors.white,
    marginTop: 60,
    marginBottom: 40,
  },
  backicon: {
    width: 30,
    height: 20,
    tintColor: 'white',
    marginTop: 20,
  },
});

export default Header;
