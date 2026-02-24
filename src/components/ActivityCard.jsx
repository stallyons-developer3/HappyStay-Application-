import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import Button from './common/Button';

const { width } = Dimensions.get('window');
const defaultImage = require('../assets/images/bonfire.png');

const ActivityCard = ({
  image,
  title,
  price,
  description,
  time,
  date,
  location,
  onPress,
  onMapPress,
  onJoinPress,
  isOwner = false,
  isPrivate = false,
  requestStatus = null,
  joinLoading = false,
  canJoin = true,
  canJoinMessage = '',
}) => {
  const imageSource =
    typeof image === 'string' ? { uri: image } : image || defaultImage;

  const displayValue = val => (val && val.trim() !== '' ? val : '–');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>

        <View style={styles.infoSection}>
          <View style={styles.infoTopRow}>
            <View style={styles.infoItem}>
              <Image
                source={require('../assets/images/icons/clock.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>{displayValue(time)}</Text>
            </View>

            <View style={styles.infoItem}>
              <Image
                source={require('../assets/images/icons/calendar-small.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>{displayValue(date)}</Text>
            </View>
          </View>

          <View style={styles.infoLocationRow}>
            <Image
              source={require('../assets/images/icons/map-pin.png')}
              style={[styles.infoIcon, { marginTop: 2 }]}
              resizeMode="contain"
            />
            <Text style={styles.locationText} numberOfLines={2}>
              {displayValue(location)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={onMapPress}
            activeOpacity={0.7}
          >
            <Image
              source={require('../assets/images/icons/map-card.png')}
              style={styles.mapIcon}
              resizeMode="contain"
            />
            <Text style={styles.mapText}>Open Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.joinSection}>
          {isOwner || requestStatus === 'accepted' ? (
            <Button title="Joined" size="full" disabled={true} />
          ) : requestStatus === 'pending' ? (
            <Button title="Pending" size="full" disabled={true} />
          ) : !canJoin ? (
            <Button
              title={canJoinMessage || 'Cannot Join'}
              size="full"
              disabled={true}
            />
          ) : (
            <Button
              title={isPrivate ? 'Request to Join' : 'Join'}
              size="full"
              onPress={onJoinPress}
              loading={joinLoading}
              disabled={joinLoading}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },
  price: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoSection: {
    gap: 6,
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    marginRight: 4,
  },
  infoText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  locationText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    flex: 1,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    marginRight: 4,
  },
  mapText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    textTransform: 'lowercase',
  },
  joinSection: {
    marginTop: 12,
  },
});

export default ActivityCard;
