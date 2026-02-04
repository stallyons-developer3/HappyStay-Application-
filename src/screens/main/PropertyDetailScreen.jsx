import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

// Static Property Data
const propertyData = {
  image: require('../../assets/images/villa.png'),
  openingHours: {
    bar: '5:00 PM - 11:00 PM',
    restaurant: '5:00 PM - 11:00 PM',
  },
  amenities: [
    {
      id: '1',
      icon: require('../../assets/images/icons/air-conditioning.png'),
      name: 'Air Conditioning',
    },
    {
      id: '2',
      icon: require('../../assets/images/icons/lockers.png'),
      name: 'Free Lockers',
    },
    {
      id: '3',
      icon: require('../../assets/images/icons/reception.png'),
      name: '24/7 Reception',
    },
    {
      id: '4',
      icon: require('../../assets/images/icons/laundry.png'),
      name: 'Laundry Facilities',
    },
  ],
  menuImages: [
    require('../../assets/images/menu1.png'),
    require('../../assets/images/menu2.png'),
  ],
  directions: {
    address: 'Via Lago 12, Como, Italy',
  },
  services: ['Free Wi-Fi', 'Bike Rental', 'Airport Shuttle', 'Luggage Storage'],
  houseRules: [
    'Pets Allowed',
    'Cancellation Policy: Free cancellation up to 24 hours before arrival',
    'Quiet Hours: 11:00 PM - 7:00 AM',
    'No Smoking in Rooms',
  ],
  wifi: {
    network: 'Lakeview_Hostel',
    password: 'lakeview123',
  },
};

const PropertyDetailScreen = ({ navigation }) => {
  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Date States
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [checkInSelected, setCheckInSelected] = useState(false);
  const [checkOutSelected, setCheckOutSelected] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Format Date
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Handle Check-in Date Change
  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      setCheckInSelected(true);
    }
  };

  // Handle Check-out Date Change
  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
      setCheckOutSelected(true);
    }
  };

  // Handle Get Direction
  const handleGetDirection = () => {
    navigation.navigate(Screens.Map);
  };

  // Handle Request Booking
  const handleRequestBooking = () => {
    setCheckInSelected(false);
    setCheckOutSelected(false);
    setShowBookingModal(true);
  };

  // Handle Book Now
  const handleBookNow = () => {
    console.log('Booking:', {
      checkIn: formatDate(checkInDate),
      checkOut: formatDate(checkOutDate),
    });
    setShowBookingModal(false);
  };

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
            source={propertyData.image}
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
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Info Title */}
          <Text style={styles.mainTitle}>Property Info</Text>

          {/* Opening Hours Section */}
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Text style={styles.hoursText}>
            Bar: {propertyData.openingHours.bar}
          </Text>
          <Text style={styles.hoursText}>
            Restaurant Menu: {propertyData.openingHours.restaurant}
          </Text>

          <View style={styles.divider} />

          {/* Amenities Section */}
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {propertyData.amenities.map(amenity => (
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

          <View style={styles.divider} />

          {/* Restaurant Menu Section */}
          <Text style={styles.sectionTitle}>Restaurant Menu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            {propertyData.menuImages.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.menuImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Directions Section */}
          <Text style={styles.sectionTitle}>Directions</Text>
          <View style={styles.directionsRow}>
            <View style={styles.addressRow}>
              <Image
                source={require('../../assets/images/icons/map-pin.png')}
                style={styles.directionIcon}
                resizeMode="contain"
              />
              <Text style={styles.addressText}>
                {propertyData.directions.address}
              </Text>
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

          <View style={styles.divider} />

          {/* Services Section */}
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesContainer}>
            {propertyData.services.map((service, index) => (
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

          <View style={styles.divider} />

          {/* House Rules Section */}
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesContainer}>
            {propertyData.houseRules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Image
                  source={require('../../assets/images/icons/check-circle.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Wi-Fi Details Section */}
          <Text style={styles.sectionTitle}>Wi-Fi Details</Text>
          <Text style={styles.wifiText}>
            Network: {propertyData.wifi.network}
          </Text>
          <Text style={styles.wifiText}>
            Password: {propertyData.wifi.password}
          </Text>
        </View>

        {/* Bottom Spacing for Button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Request Booking Button - Fixed at Bottom */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title="Request Booking"
          onPress={handleRequestBooking}
          size="full"
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
              style={styles.bookNowButton}
              activeOpacity={0.8}
              onPress={handleBookNow}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
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
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Main Title
  mainTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 10,
  },

  // Section Title
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginBottom: 12,
  },

  // Opening Hours
  hoursText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textBlack,
    lineHeight: 22,
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

  // Restaurant Menu
  menuScrollContent: {
    paddingRight: 20,
  },
  menuImage: {
    width: 100,
    height: 130,
    borderRadius: 12,
    marginRight: 12,
  },

  // Directions
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  getDirectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 22,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 100,
  },

  // Bottom Button
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
    marginBottom: 24,
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

export default PropertyDetailScreen;
