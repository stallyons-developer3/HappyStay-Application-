import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { Linking, Platform } from 'react-native';

// Components
import HangoutCard from '../../components/HangoutCard';
import FloatingMapButton from '../../components/FloatingMapButton';

// Dummy Data
const myHangoutsData = [
  {
    id: '1',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
    ],
  },
  {
    id: '2',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
    ],
  },
  {
    id: '3',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
    ],
  },
];

const ManageScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Header - Same Height as HomeScreen */}
        <View style={styles.header}>
          {/* Top Row */}
          <View style={styles.topRow}>
            {/* Left - Profile & Title */}
            <View style={styles.leftSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.profileContainer}
                onPress={() => navigation.navigate(Screens.Profile)}
              >
                <Image
                  source={require('../../assets/images/profile.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage Hangouts</Text>
            </View>

            {/* Right - Notification */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.notificationContainer}
            >
              <View style={styles.notificationIconWrapper}>
                <Image
                  source={require('../../assets/images/icons/notification.png')}
                  style={styles.notificationIcon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Greeting Row with Create Button - Same marginTop as HomeScreen */}
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Create Your{'\n'}Hangout</Text>
            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CreateHangout')}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hangout Cards */}
        <View style={styles.cardsContainer}>
          {myHangoutsData.map(hangout => (
            <HangoutCard
              key={hangout.id}
              profileImage={hangout.profileImage}
              name={hangout.name}
              activityType={hangout.activityType}
              description={hangout.description}
              peopleCount={hangout.peopleCount}
              peopleImages={hangout.peopleImages}
              showMenu={true}
              onPress={() => console.log('Hangout pressed:', hangout.name)}
              onJoinPress={() => console.log('Join pressed:', hangout.name)}
              onEditPress={() =>
                navigation.navigate(Screens.CreateHangout, {
                  isEdit: true,
                  hangout: hangout,
                })
              }
              onDeletePress={() => console.log('Delete pressed:', hangout.id)}
            />
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Map Button */}
      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header - Same as HomeScreen Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerTitle: {
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

  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60, // Changed from 60 to 30
    marginBottom: 10,
  },
  greeting: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 28,
    color: Colors.white,
    lineHeight: 38,
  },
  createButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.primary,
  },

  // Cards
  cardsContainer: {
    marginTop: 20,
  },
  bottomSpacing: {
    height: 0,
  },
});

export default ManageScreen;
