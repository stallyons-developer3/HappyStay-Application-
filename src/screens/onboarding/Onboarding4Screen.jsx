import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import TripCard from '../../components/TripCard';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROPERTY, PROFILE } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import { saveUserData } from '../../utils/storage';

const Onboarding4Screen = ({ navigation }) => {
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [checkInSelected, setCheckInSelected] = useState(false);
  const [checkOutSelected, setCheckOutSelected] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Refresh user profile in Redux before navigating to MainApp
  const refreshAndNavigate = async () => {
    try {
      const response = await api.get(PROFILE.GET_PROFILE);
      if (response.data?.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        await saveUserData(response.data.user);
      }
    } catch (error) {
      console.log('Profile refresh error:', error);
    }
    navigation.replace('MainApp');
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await api.get(PROPERTY.GET_ALL);
      if (response.data?.success) {
        setProperties(response.data.properties || []);
      }
    } catch (error) {
      console.log('Fetch properties error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const formatDateForApi = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      setCheckInSelected(true);
      if (selectedDate >= checkOutDate) {
        setCheckOutSelected(false);
      }
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
      setCheckOutSelected(true);
    }
  };

  const handleRequestBooking = property => {
    if (property.user_request_status) {
      showToast('info', `Status: ${property.user_request_status}`);
      return;
    }
    setSelectedProperty(property);
    setCheckInSelected(false);
    setCheckOutSelected(false);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setShowBookingModal(true);
  };

  const handleBookNow = async () => {
    if (!checkInSelected || !checkOutSelected) {
      showToast('error', 'Please select both check-in and check-out dates.');
      return;
    }
    if (checkOutDate <= checkInDate) {
      showToast('error', 'Check-out date must be after check-in date.');
      return;
    }

    setIsBooking(true);
    try {
      const response = await api.post(PROPERTY.BOOK(selectedProperty.id), {
        check_in: formatDateForApi(checkInDate),
        check_out: formatDateForApi(checkOutDate),
      });

      if (response.data?.success) {
        setShowBookingModal(false);
        setProperties(prev =>
          prev.map(p =>
            p.id === selectedProperty.id
              ? { ...p, user_request_status: 'pending' }
              : p,
          ),
        );
        showToast('success', response.data.message || 'Booking request sent!');
        setTimeout(() => refreshAndNavigate(), 1000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to send booking request.';
      showToast('error', errorMsg);
    } finally {
      setIsBooking(false);
    }
  };

  const getBookingButtonText = status => {
    if (!status) return 'Request Booking';
    switch (status) {
      case 'pending':
        return 'Pending...';
      case 'accepted':
        return 'Accepted ✓';
      case 'declined':
        return 'Declined ✕';
      default:
        return 'Request Booking';
    }
  };

  const handleSkip = () => {
    refreshAndNavigate();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Where are you going next?</Text>
          <Text style={styles.subtitle}>
            Search for hostels/properties you will visit and{'\n'}
            ask them to join their communities
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : properties.length === 0 ? (
          <Text style={styles.emptyText}>No properties available</Text>
        ) : (
          <View style={styles.cardsContainer}>
            {properties.map(property => (
              <TripCard
                key={property.id}
                image={
                  property.thumbnail
                    ? { uri: property.thumbnail }
                    : require('../../assets/images/villa.png')
                }
                title={property.name}
                location={property.location}
                showBookingButton={true}
                bookingButtonText={getBookingButtonText(
                  property.user_request_status,
                )}
                bookingDisabled={!!property.user_request_status}
                onBookingPress={() => handleRequestBooking(property)}
                onPress={() => {}}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button title="Skip" onPress={handleSkip} size="full" />
      </View>

      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedProperty && (
              <Text style={styles.propertyName}>{selectedProperty.name}</Text>
            )}

            <Text style={styles.dateLabel}>Check-in</Text>
            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.7}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text
                style={
                  checkInSelected ? styles.dateText : styles.datePlaceholder
                }
              >
                {checkInSelected ? formatDate(checkInDate) : 'Select'}
              </Text>
              <Image
                source={require('../../assets/images/calender.png')}
                style={styles.calendarIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.dateLabel}>Check-out</Text>
            <TouchableOpacity
              style={styles.dateInput}
              activeOpacity={0.7}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text
                style={
                  checkOutSelected ? styles.dateText : styles.datePlaceholder
                }
              >
                {checkOutSelected ? formatDate(checkOutDate) : 'Select'}
              </Text>
              <Image
                source={require('../../assets/images/calender.png')}
                style={styles.calendarIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookNowButton, isBooking && { opacity: 0.6 }]}
              activeOpacity={0.8}
              onPress={handleBookNow}
              disabled={isBooking}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.bookNowText}>Book Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckInChange}
          minimumDate={new Date()}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckOutChange}
          minimumDate={checkInDate}
        />
      )}
    </View>
  );
};

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SAFE_TOP,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  titleSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 22,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 20,
  },
  cardsContainer: {
    overflow: 'visible',
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginTop: 50,
  },
  bottomContainer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  modalTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalClose: {
    fontSize: 14,
    color: Colors.textBlack,
    fontWeight: '700',
  },
  propertyName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  dateText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  datePlaceholder: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textDark,
  },
  bookNowButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    width: 120,
    alignSelf: 'center',
  },
  bookNowText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.white,
    textTransform: 'lowercase',
  },
});

export default Onboarding4Screen;
