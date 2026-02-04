import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
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
  // Handle Get Direction
  const handleGetDirection = () => {
    navigation.navigate(Screens.Map);
  };

  // Handle Request Booking
  const handleRequestBooking = () => {
    console.log('Request Booking');
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
    marginTop: 22,
    marginBottom: 13,
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
  bookingButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  bookingButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
  },
});

export default PropertyDetailScreen;
