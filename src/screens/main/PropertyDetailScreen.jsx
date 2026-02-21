import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROPERTY } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

// Amenity icon mapping
const amenityIcons = {
  air_conditioning: require('../../assets/images/icons/air-conditioning.png'),
  free_lockers: require('../../assets/images/icons/lockers.png'),
  reception: require('../../assets/images/icons/reception.png'),
  laundry_facilities: require('../../assets/images/icons/laundry.png'),
};

const amenityLabels = {
  air_conditioning: 'Air Conditioning',
  free_lockers: 'Free Lockers',
  reception: '24/7 Reception',
  laundry_facilities: 'Laundry Facilities',
};

const PropertyDetailScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const { propertyId } = route.params || {};

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Date States
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [checkInSelected, setCheckInSelected] = useState(false);
  const [checkOutSelected, setCheckOutSelected] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Menu Image Viewer
  const [menuImages, setMenuImages] = useState([]);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // Fetch property detail
  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetail();
    }
  }, [propertyId]);

  const fetchPropertyDetail = async () => {
    try {
      const response = await api.get(PROPERTY.GET_DETAIL(propertyId));
      if (response.data?.success) {
        setProperty(response.data.property);
      }
    } catch (error) {
      console.log('Fetch property detail error:', error);
      showToast('error', 'Failed to load property details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format Date for display
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Format Date for API
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

  // Handle Get Direction
  const handleGetDirection = () => {
    if (property?.latitude && property?.longitude) {
      navigation.navigate(Screens.LocationMap, {
        latitude: property.latitude,
        longitude: property.longitude,
        title: property.name || 'Property',
        location: property.address || property.location || '',
      });
    } else {
      showToast('info', 'No coordinates available for this property.');
    }
  };

  // Menu images displayed directly in grid on screen

  // Handle Request Booking
  const handleRequestBooking = () => {
    if (property?.user_request_status) {
      showToast('info', `Your booking status: ${property.user_request_status}`);
      return;
    }
    setCheckInSelected(false);
    setCheckOutSelected(false);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setShowBookingModal(true);
  };

  // Handle Book Now - API Call
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
      const response = await api.post(PROPERTY.BOOK(propertyId), {
        check_in: formatDateForApi(checkInDate),
        check_out: formatDateForApi(checkOutDate),
      });

      if (response.data?.success) {
        setShowBookingModal(false);
        showToast('success', response.data.message || 'Booking request sent!');
        // Update local status
        setProperty(prev => ({ ...prev, user_request_status: 'pending' }));
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

  // Get button text based on status
  const getButtonText = () => {
    if (!property?.user_request_status) return 'Request Booking';
    switch (property.user_request_status) {
      case 'pending':
        return 'Booking Pending...';
      case 'accepted':
        return 'Booking Accepted ✓';
      case 'declined':
        return 'Booking Declined ✕';
      default:
        return 'Request Booking';
    }
  };

  // Build amenities list from property data
  const getAmenities = () => {
    if (!property) return [];
    const amenities = [];
    const keys = [
      'air_conditioning',
      'free_lockers',
      'reception',
      'laundry_facilities',
    ];
    keys.forEach(key => {
      if (property[key]) {
        amenities.push({
          id: key,
          icon: amenityIcons[key],
          name: amenityLabels[key],
        });
      }
    });
    return amenities;
  };

  // Build services list
  const getServices = () => {
    if (!property) return [];
    const services = [];
    if (property.wifi) services.push('Free Wi-Fi');
    if (property.bike_rental) services.push('Bike Rental');
    if (property.airport_shuttle) services.push('Airport Shuttle');
    if (property.luggage_storage) services.push('Luggage Storage');
    return services;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const amenities = getAmenities();
  const services = getServices();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              property.thumbnail
                ? { uri: property.thumbnail }
                : require('../../assets/images/villa.png')
            }
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/icons/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Status Badge */}
          {property.user_request_status && (
            <View
              style={[
                styles.statusBadge,
                property.user_request_status === 'accepted' &&
                  styles.statusAccepted,
                property.user_request_status === 'declined' &&
                  styles.statusDeclined,
                property.user_request_status === 'pending' &&
                  styles.statusPending,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {property.user_request_status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Name & Location */}
          <Text style={styles.mainTitle}>{property.name}</Text>
          {/* {property.location && (
            <View style={styles.locationRow}>
              <Image
                source={require('../../assets/images/icons/map-pin.png')}
                style={styles.locationIcon}
                resizeMode="contain"
              />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>
          )} */}

          {/* Opening Hours + Restaurant Menu Section */}
          {property.opening_hours &&
            property.opening_hours.length > 0 &&
            (() => {
              const allMenuImages = property.opening_hours.reduce(
                (acc, hour) => {
                  const menus = Array.isArray(hour.menu)
                    ? hour.menu
                    : hour.menu
                    ? [hour.menu]
                    : [];
                  return [...acc, ...menus];
                },
                [],
              );
              return (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>Opening Hours</Text>
                  {property.opening_hours.map((hour, index) => (
                    <View key={index} style={styles.hourRow}>
                      <Text style={styles.hoursText}>
                        {hour.title}: {hour.start_time} - {hour.end_time}
                      </Text>
                    </View>
                  ))}
                  {allMenuImages.length > 0 && (
                    <>
                      <View style={styles.divider} />
                      <Text style={styles.sectionTitle}>Restaurant Menu</Text>
                      <View style={styles.menuGrid}>
                        {allMenuImages.map((img, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.menuGridItem}
                            activeOpacity={0.9}
                            onPress={() => {
                              setMenuImages(allMenuImages);
                              setCurrentMenuIndex(idx);
                              setShowMenuModal(true);
                            }}
                          >
                            <Image
                              source={{ uri: img }}
                              style={styles.menuGridImage}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </>
              );
            })()}

          {/* Amenities Section */}
          {amenities.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenities.map(amenity => (
                  <View key={amenity.id} style={styles.amenityItem}>
                    <Image
                      source={amenity.icon}
                      style={styles.amenityIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.amenityText}>{amenity.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Directions Section */}
          {property.location && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Directions</Text>
              <View style={styles.directionsRow}>
                <View style={styles.addressRow}>
                  <Image
                    source={require('../../assets/images/icons/map-pin.png')}
                    style={styles.directionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.addressText}>{property.location}</Text>
                </View>
                <TouchableOpacity
                  style={styles.getDirectionButton}
                  onPress={handleGetDirection}
                  activeOpacity={0.7}
                >
                  <Image
                    source={require('../../assets/images/icons/direction.png')}
                    style={styles.directionButtonIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.getDirectionText}>Get Direction</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Services Section */}
          {services.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.servicesContainer}>
                {services.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Image
                      source={require('../../assets/images/icons/check-circle.png')}
                      style={styles.checkIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* House Rules Section */}
          {property.house_rules && property.house_rules.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>House Rules</Text>
              <View style={styles.rulesContainer}>
                {property.house_rules.map((item, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Image
                      source={require('../../assets/images/icons/check-circle.png')}
                      style={styles.checkIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.ruleText}>{item.rule}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Wi-Fi Details Section */}
          {property.wifi && property.wifi_network && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Wi-Fi Details</Text>
              <Text style={styles.wifiText}>
                Network: {property.wifi_network}
              </Text>
              {property.wifi_password && (
                <Text style={styles.wifiText}>
                  Password: {property.wifi_password}
                </Text>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Request Booking Button */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title={getButtonText()}
          onPress={handleRequestBooking}
          size="full"
          disabled={!!property.user_request_status}
        />
      </View>

      {/* Booking Modal */}
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

            {/* Property Name */}
            <Text style={styles.modalPropertyName}>{property.name}</Text>

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

      {/* Menu Image Fullscreen Modal */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.menuModalOverlay}>
          <TouchableOpacity
            style={styles.menuModalClose}
            onPress={() => setShowMenuModal(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuModalCloseText}>✕</Text>
          </TouchableOpacity>
          {menuImages.length > 0 && (
            <Image
              source={{ uri: menuImages[currentMenuIndex] }}
              style={styles.menuModalImage}
              resizeMode="contain"
            />
          )}
          {menuImages.length > 1 && (
            <View style={styles.menuModalNav}>
              <TouchableOpacity
                onPress={() =>
                  setCurrentMenuIndex(prev =>
                    prev > 0 ? prev - 1 : menuImages.length - 1,
                  )
                }
                style={styles.menuModalNavBtn}
              >
                <Text style={styles.menuModalNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.menuModalCounter}>
                {currentMenuIndex + 1} / {menuImages.length}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCurrentMenuIndex(prev =>
                    prev < menuImages.length - 1 ? prev + 1 : 0,
                  )
                }
                style={styles.menuModalNavBtn}
              >
                <Text style={styles.menuModalNavText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
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
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 12,
  },
  goBackText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },

  // Hero Image
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  statusBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: '#FFA500',
  },
  statusAccepted: {
    backgroundColor: Colors.primary,
  },
  statusDeclined: {
    backgroundColor: '#FF4444',
  },
  statusBadgeText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 11,
    color: Colors.white,
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  mainTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  locationText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textGray,
  },

  // Section Title
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginBottom: 12,
  },

  // Opening Hours
  hourRow: {
    marginBottom: 4,
  },
  hoursText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textBlack,
    lineHeight: 22,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  menuGridItem: {
    width: (width - 60) / 4,
    height: ((width - 60) / 4) * 1.35,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  menuGridImage: {
    width: '100%',
    height: '100%',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 20,
    marginBottom: 8,
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  amenityItem: {
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F7F8FB',
  },
  amenityIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  amenityText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textDark,
    flex: 1,
  },

  // Directions
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  directionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  addressText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    flex: 1,
    flexShrink: 1,
  },
  getDirectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  directionButtonIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primary,
    marginRight: 6,
  },
  getDirectionText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.textBlack,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },

  // Services
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  serviceText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
  },

  // House Rules
  rulesContainer: {
    gap: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    flex: 1,
    lineHeight: 22,
  },

  // Wi-Fi Details
  wifiText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    flex: 1,
    lineHeight: 22,
  },

  // Bottom
  bottomSpacing: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
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
  modalPropertyName: {
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

  // Menu Image Modal
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuModalCloseText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
  },
  menuModalImage: {
    width: width - 20,
    height: '75%',
  },
  menuModalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    position: 'absolute',
    bottom: 40,
  },
  menuModalNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalNavText: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '700',
  },
  menuModalCounter: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: Fonts.RobotoMedium,
  },
});

export default PropertyDetailScreen;
