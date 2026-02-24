import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import { logoutUser, setUser } from '../../store/slices/authSlice';
import { saveUserData } from '../../utils/storage';
import Button from '../../components/common/Button';
import TripCard from '../../components/TripCard';
import api from '../../api/axiosInstance';
import { PROPERTY, PROFILE } from '../../api/endpoints';

const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [pastTrips, setPastTrips] = useState([]);
  const [nextTrips, setNextTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(PROFILE.GET_PROFILE);
      if (response.data?.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        await saveUserData(response.data.user);
      }
    } catch (error) {
      console.log('Fetch profile error:', error);
    }
  }, [dispatch]);

  const fetchMyTrips = useCallback(async () => {
    try {
      const response = await api.get(PROPERTY.MY_TRIPS);
      if (response.data?.success) {
        setPastTrips(response.data.past_trips || []);
        setNextTrips(response.data.next_trips || []);
      }
    } catch (error) {
      console.log('Fetch trips error:', error);
    } finally {
      setTripsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMyTrips();
  }, [fetchProfile, fetchMyTrips]);

  // Re-fetch when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProfile();
      fetchMyTrips();
    });
    return unsubscribe;
  }, [navigation, fetchProfile, fetchMyTrips]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
    fetchMyTrips();
  }, [fetchProfile, fetchMyTrips]);

  const getProfileImage = () => {
    if (user?.profile_picture) {
      const uri = user.profile_picture.startsWith('http')
        ? user.profile_picture
        : `${STORAGE_URL}/storage/profile_pictures/${user.profile_picture}`;
      return { uri };
    }
    return require('../../assets/images/profile.png');
  };

  const getTripImage = thumbnail => {
    if (thumbnail) {
      return { uri: thumbnail };
    }
    return require('../../assets/images/villa.png');
  };

  const displayName =
    user?.full_name || user?.first_name || user?.name || 'User';
  const displayEmail = user?.email || '';
  const displayProperty = user?.property?.name;
  const displayCheckin = user?.check_in;
  const displayCheckout = user?.check_out;

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

  const renderTripSection = (title, trips) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {tripsLoading ? (
        <ActivityIndicator
          size="small"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : trips.length > 0 ? (
        trips.map(trip => (
          <TripCard
            key={trip.id}
            image={getTripImage(trip.property?.thumbnail)}
            title={trip.property?.name || 'Property'}
            location={trip.property?.location || ''}
            checkIn={formatDate(trip.check_in)}
            checkOut={formatDate(trip.check_out)}
            onPress={() =>
              trip.property?.id &&
              navigation.navigate(Screens.PropertyDetail, {
                propertyId: trip.property.id,
              })
            }
          />
        ))
      ) : (
        <Text style={styles.emptyText}>No {title.toLowerCase()} yet</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
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
          <Text style={styles.profileProperty}>{displayProperty}</Text>
          <View style={styles.checinLine}>
            <Text style={styles.checkinout}>{displayCheckin} - </Text>
            <Text style={styles.checkinout}>{displayCheckout}</Text>
          </View>
        </View>

        {renderTripSection('Past Trips', pastTrips)}
        {renderTripSection('Next Trips', nextTrips)}

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
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    paddingVertical: 16,
  },
  loader: {
    paddingVertical: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  buttonsContainer: {
    gap: 12,
  },
  checinLine: {
    display: 'flex',
    flexDirection: 'row',
  },
  checkinout: {
    fontFamily: Fonts.RobotoBold,
  },
  profileProperty: {
    fontFamily: Fonts.RobotoBold,
  },
});

export default ProfileScreen;
