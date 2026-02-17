import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';

// Components
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import TripCard from '../../components/TripCard';
import FloatingMapButton from '../../components/FloatingMapButton';

// API
import api from '../../api/axiosInstance';
import { PROPERTY } from '../../api/endpoints';
import { useBadgeCounts } from '../../context/BadgeContext';

const TripScreen = ({ navigation }) => {
  const { notificationCount } = useBadgeCounts();
  const [searchText, setSearchText] = useState('');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  // Date States
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [checkInSelected, setCheckInSelected] = useState(false);
  const [checkOutSelected, setCheckOutSelected] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties(1, true);
  }, []);

  const fetchProperties = async (pageNum = 1, reset = false) => {
    try {
      const params = { page: pageNum };
      if (searchText.trim()) {
        params.search = searchText.trim();
      }

      const response = await api.get(PROPERTY.GET_ALL, { params });

      if (response.data?.success) {
        const newProperties = response.data.properties || [];
        if (reset) {
          setProperties(newProperties);
        } else {
          setProperties(prev => [...prev, ...newProperties]);
        }

        if (response.data.pagination) {
          setPage(response.data.pagination.current_page);
          setLastPage(response.data.pagination.last_page);
        }
      }
    } catch (error) {
      console.log('Fetch properties error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Search handler
  const handleSearch = () => {
    setIsLoading(true);
    setPage(1);
    fetchProperties(1, true);
  };

  // Pull to refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchProperties(1, true);
  };

  // Load more (pagination)
  const handleLoadMore = () => {
    if (page < lastPage && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchProperties(page + 1, false);
    }
  };

  // Scroll handler for pagination
  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    if (isCloseToBottom) {
      handleLoadMore();
    }
  };

  // Format Date for display
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Format Date for API (YYYY-MM-DD)
  const formatDateForApi = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Date handlers
  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      setCheckInSelected(true);
      // Reset check-out if it's before check-in
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

  // Open booking modal
  const handleRequestBooking = property => {
    if (property.user_request_status) {
      Alert.alert(
        'Already Requested',
        `Your booking status: ${property.user_request_status}`,
      );
      return;
    }
    setSelectedProperty(property);
    setCheckInSelected(false);
    setCheckOutSelected(false);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setShowBookingModal(true);
  };

  // Book Now - API call
  const handleBookNow = async () => {
    if (!checkInSelected || !checkOutSelected) {
      Alert.alert('Error', 'Please select both check-in and check-out dates.');
      return;
    }

    if (checkOutDate <= checkInDate) {
      Alert.alert('Error', 'Check-out date must be after check-in date.');
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
        Alert.alert(
          'Success',
          response.data.message || 'Booking request sent!',
        );

        // Update property status locally
        setProperties(prev =>
          prev.map(p =>
            p.id === selectedProperty.id
              ? { ...p, user_request_status: 'pending' }
              : p,
          ),
        );
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to send booking request.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsBooking(false);
    }
  };

  // Get booking button text based on status
  const getBookingButtonText = status => {
    if (!status) return 'Request Booking';
    switch (status) {
      case 'pending':
        return 'Pending...';
      case 'accepted':
        return 'Accepted';
      case 'declined':
        return 'Declined';
      default:
        return 'Request Booking';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <Header
          title="Trip"
          showGreeting={true}
          showBackIcon={true}
          onBackPress={() => navigation.goBack()}
          greeting="Select Your Trip"
          notificationCount={notificationCount}
          onProfilePress={() => navigation.navigate(Screens.Profile)}
          onNotificationPress={() => navigation.navigate(Screens.Notification)}
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Find your property"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={handleSearch}
          showActionButton={false}
        />

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
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
                onPress={() =>
                  navigation.navigate(Screens.PropertyDetail, {
                    propertyId: property.id,
                  })
                }
              />
            ))}

            {/* Loading More Indicator */}
            {isLoadingMore && (
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={{ marginVertical: 20 }}
              />
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Map Button */}
      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Property Name */}
            {selectedProperty && (
              <Text style={styles.propertyName}>{selectedProperty.name}</Text>
            )}

            {/* Check-in */}
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

            {/* Check-out */}
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

            {/* Book Now Button */}
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

      {/* Date Pickers */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  bottomSpacing: {
    height: 70,
  },

  // Modal
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

  // Date Input
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

  // Book Now Button
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

export default TripScreen;
