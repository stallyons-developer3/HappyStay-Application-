import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import { logoutUser } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import TripCard from '../../components/TripCard';

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
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const getProfileImage = () => {
    if (user?.profile_picture) {
      const uri = user.profile_picture.startsWith('http')
        ? user.profile_picture
        : `${STORAGE_URL}/storage/profile_pictures/${user.profile_picture}`;
      return { uri };
    }
    return require('../../assets/images/profile.png');
  };

  const displayName =
    user?.full_name || user?.first_name || user?.name || 'User';
  const displayEmail = user?.email || '';

  const handleTrips = () => {
    navigation.navigate(Screens.Trip);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutUser());
          navigation.reset({
            index: 0,
            routes: [{ name: Screens.Welcome }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
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
          <Text style={styles.headerTitle}>Personal Data</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={getProfileImage()}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
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
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
        </View>

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

        <View style={styles.spacer} />

        <View style={styles.buttonsContainer}>
          <Button title="Trips" onPress={handleTrips} size="full" />
          <Button title="Logout" onPress={handleLogout} size="full" />
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    textAlign: 'center',
  },
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  buttonsContainer: {
    gap: 12,
  },
});

export default ProfileScreen;
