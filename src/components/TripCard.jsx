import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const TripCard = ({
  image,
  title,
  location,
  checkIn,
  checkOut,
  showBookingButton = false,
  onBookingPress,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      {/* Trip Image */}
      <Image source={image} style={styles.tripImage} resizeMode="cover" />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Image
            source={require('../assets/images/icons/map-pin.png')}
            style={styles.locationIcon}
            resizeMode="contain"
          />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        {/* Check-in & Check-out (Profile Screen variant) */}
        {checkIn && <Text style={styles.dateText}>Check-in: {checkIn}</Text>}
        {checkOut && <Text style={styles.dateText}>Check-out: {checkOut}</Text>}

        {/* Request Booking Button (Trip Screen variant) */}
        {showBookingButton && (
          <TouchableOpacity
            style={styles.bookingButton}
            activeOpacity={0.8}
            onPress={onBookingPress}
          >
            <Text style={styles.bookingButtonText}>Request Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    // Shadow for iOS
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 5,
  },
  tripImage: {
    width: 100,
    height: 90,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 2,
  },
  title: {
    fontFamily: Fonts.kantumruyBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  locationText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  dateText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  bookingButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bookingButtonText: {
    fontFamily: Fonts.kantumruyBold,
    fontSize: 12,
    color: Colors.white,
  },
});

export default TripCard;
