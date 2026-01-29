import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts } from '../../constants/Constants';

// Dummy Notifications Data
const notificationsData = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    description:
      'Your booking for Dream Villa has been confirmed for Dec 25-28.',
    time: '2 min ago',
  },
  {
    id: '2',
    type: 'hangout',
    title: 'New Hangout Request',
    description: 'Jessica wants to join your Hiking hangout.',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'activity',
    title: 'Activity Reminder',
    description: "Bonfire event starts in 2 hours. Don't miss it!",
    time: '1 hour ago',
  },
  {
    id: '4',
    type: 'promo',
    title: 'Special Offer',
    description: 'Get 20% off on your next booking. Use code: HAPPY20',
    time: '3 hours ago',
  },
  {
    id: '5',
    type: 'chat',
    title: 'New Message',
    description: 'You have a new message from Beach Party group.',
    time: '5 hours ago',
  },
  {
    id: '6',
    type: 'booking',
    title: 'Booking Reminder',
    description: 'Your check-in at Dream Villa is tomorrow.',
    time: 'Yesterday',
  },
  {
    id: '7',
    type: 'hangout',
    title: 'Hangout Updated',
    description: 'The hiking hangout time has been changed to 8:00 AM.',
    time: 'Yesterday',
  },
  {
    id: '8',
    type: 'activity',
    title: 'New Activity Added',
    description: 'A new Beach Party activity has been added near you.',
    time: '2 days ago',
  },
];

// Get icon based on notification type
const getNotificationIcon = type => {
  switch (type) {
    case 'booking':
      return require('../../assets/images/icons/calendar-small.png');
    case 'hangout':
      return require('../../assets/images/icons/hangouts.png');
    case 'activity':
      return require('../../assets/images/icons/activities.png');
    case 'promo':
      return require('../../assets/images/icons/promo-icon.png');
    case 'chat':
      return require('../../assets/images/icons/chat.png');
    default:
      return require('../../assets/images/icons/notification.png');
  }
};

// Get background color based on notification type
const getIconBgColor = type => {
  switch (type) {
    case 'booking':
      return '#E8F5E9';
    case 'hangout':
      return '#E3F2FD';
    case 'activity':
      return '#FFF3E0';
    case 'promo':
      return '#FCE4EC';
    case 'chat':
      return '#E8F5E9';
    default:
      return '#F5F5F5';
  }
};

const NotificationScreen = ({ navigation }) => {
  // Handle notification press
  const handleNotificationPress = notification => {
    console.log('Notification pressed:', notification.title);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/arrow-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Cards */}
        {notificationsData.map(notification => (
          <TouchableOpacity
            key={notification.id}
            style={styles.notificationCard}
            activeOpacity={0.7}
            onPress={() => handleNotificationPress(notification)}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getIconBgColor(notification.type) },
              ]}
            >
              <Image
                source={getNotificationIcon(notification.type)}
                style={styles.notificationIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationDescription} numberOfLines={2}>
                {notification.description}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {notificationsData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/images/icons/notification.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyDescription}>
              You don't have any notifications yet.
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textBlack,
  },
  headerTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.primary,
    marginLeft: 8,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Notification Card
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notificationIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },

  // Content
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: Colors.textBlack,
  },
  notificationDescription: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 8,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: Colors.textLight,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textGray,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 40,
  },
});

export default NotificationScreen;
