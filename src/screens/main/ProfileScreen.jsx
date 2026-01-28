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

// Components
import TripCard from '../../components/TripCard';

// Static Past Trips Data
const pastTripsData = [
  {
    id: '1',
    image: require('../../assets/images/villa.png'),
    title: 'Dream Villa',
    location: 'Sorem ipsum dolor sit.',
    checkIn: '12-1-2026',
    checkOut: '12-1-2026',
  },
];

// Static Next Trips Data
const nextTripsData = [
  {
    id: '1',
    image: require('../../assets/images/villa.png'),
    title: 'The Villa',
    location: 'Sorem ipsum dolor sit.',
    checkIn: '12-1-2026',
    checkOut: '12-1-2026',
  },
];

const ProfileScreen = ({ navigation }) => {
  // Handle Trips
  const handleTrips = () => {
    navigation.navigate(Screens.Trip);
  };

  // Handle Logout
  const handleLogout = () => {
    console.log('Logout');
    // navigation.replace(Screens.Login);
  };

  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/icons/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.headerTitle}>Personal Data</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image with Edit Button */}
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={require('../../assets/images/profile.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Screens.EditProfile)}
            >
              <Image
                source={require('../../assets/images/icons/profile-edit.png')}
                style={styles.editIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.profileName}>Jenny</Text>

          {/* Email */}
          <Text style={styles.profileEmail}>Jenny@email.com</Text>
        </View>

        {/* Past Trips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Trips</Text>

          {pastTripsData.map(trip => (
            <TripCard
              key={trip.id}
              image={trip.image}
              title={trip.title}
              location={trip.location}
              checkIn={trip.checkIn}
              checkOut={trip.checkOut}
            />
          ))}
        </View>

        {/* Next Trips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Trips</Text>

          {nextTripsData.map(trip => (
            <TripCard
              key={trip.id}
              image={trip.image}
              title={trip.title}
              location={trip.location}
              checkIn={trip.checkIn}
              checkOut={trip.checkOut}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Trips Button */}
          <TouchableOpacity
            style={styles.tripsButton}
            activeOpacity={0.8}
            onPress={handleTrips}
          >
            <Text style={styles.tripsButtonText}>Trips</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Header
  header: {
    paddingTop: 50,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textBlack,
  },
  headerTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.primary,
    textAlign: 'center',
  },

  // Profile Section
  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    padding: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.white,
  },
  profileName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textGray,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 16,
  },

  // Spacer
  spacer: {
    flex: 1,
    minHeight: 40,
  },

  // Buttons
  buttonsContainer: {
    gap: 12,
  },
  tripsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  tripsButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
});

export default ProfileScreen;
