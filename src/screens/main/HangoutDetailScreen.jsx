import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';

// Dummy Requests Data
const requestsData = [
  {
    id: '1',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Anna Jones',
    date: 'Dec 30, 2026',
    daysAgo: '0 days',
  },
  {
    id: '2',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Anna Jones',
    date: 'Dec 30, 2026',
    daysAgo: '0 days',
  },
  {
    id: '3',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Anna Jones',
    date: 'Dec 30, 2026',
    daysAgo: '0 days',
  },
  {
    id: '4',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Anna Jones',
    date: 'Dec 30, 2026',
    daysAgo: '0 days',
  },
];

const HangoutDetailScreen = ({ navigation }) => {
  // Handle Accept
  const handleAccept = requestId => {
    console.log('Accept request:', requestId);
  };

  // Handle Decline
  const handleDecline = requestId => {
    console.log('Decline request:', requestId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Green Header with Image */}
        <View style={styles.header}>
          {/* Back Button */}
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

          {/* Hangout Image */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/mountain-1.png')}
              style={styles.hangoutImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.title}>Bonfire</Text>

              {/* Location */}
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/map-pin.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>Pool Site</Text>
              </View>

              {/* Age Range */}
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/users.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>18-30</Text>
              </View>
            </View>

            {/* Category Tag */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>Party</Text>
            </View>
          </View>

          {/* Time Row */}
          <View style={styles.timeRow}>
            <Image
              source={require('../../assets/images/icons/clock.png')}
              style={styles.timeIcon}
              resizeMode="contain"
            />
            <Text style={styles.timeText}>8:00 PM - 5:00 AM</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has.
          </Text>

          {/* People Joined */}
          <Text style={styles.peopleJoined}>36 People Joined</Text>

          {/* Requests Section */}
          <Text style={styles.requestsTitle}>Requests</Text>

          {/* Request Items */}
          {requestsData.map(request => (
            <View key={request.id} style={styles.requestItem}>
              {/* Profile */}
              <Image
                source={request.profileImage}
                style={styles.requestProfile}
                resizeMode="cover"
              />

              {/* Info */}
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestDate}>{request.date}</Text>
                <Text style={styles.requestDate}>{request.daysAgo}</Text>
              </View>

              {/* Buttons */}
              <View style={styles.requestButtons}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  activeOpacity={0.8}
                  onPress={() => handleAccept(request.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.declineButton}
                  activeOpacity={0.8}
                  onPress={() => handleDecline(request.id)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Map Button */}
      <TouchableOpacity
        style={styles.floatingMapButton}
        activeOpacity={0.9}
        onPress={() => navigation.navigate(Screens.Map)}
      >
        <Image
          source={require('../../assets/images/icons/map.png')}
          style={styles.mapIcon}
          resizeMode="contain"
        />
        <Text style={styles.mapText}>Map</Text>
      </TouchableOpacity>
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
    paddingBottom: 80,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  imageContainer: {
    width: 200,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  hangoutImage: {
    width: '100%',
    height: '100%',
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Title Row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginRight: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  infoText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  categoryTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: Colors.white,
  },

  // Time Row
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.primary,
    marginRight: 6,
  },
  timeText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textGray,
  },

  // Description
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 20,
  },

  // People Joined
  peopleJoined: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
  },

  // Requests Section
  requestsTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
  },

  // Request Item
  requestItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to 'flex-start'
    marginBottom: 16,
  },
  requestProfile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.textBlack,
  },
  requestDate: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  requestButtons: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Added this
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 4,
  },
  acceptButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.white,
    textTransform: 'lowercase',
  },
  declineButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF1500',
  },
  declineButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: '#FF1500',
    textTransform: 'lowercase',
  },

  // Floating Map Button
  floatingMapButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  mapIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
    marginRight: 8,
  },
  mapText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default HangoutDetailScreen;
