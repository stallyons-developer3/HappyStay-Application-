import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import HeartIcon from './common/HeartIcon';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.1;
const defaultImage = require('../assets/images/bonfire.png');

const typologyLabels = {
  nature_active: 'Nature & Active',
  sightseeing: 'Sightseeing',
  party: 'Party',
  event: 'Event',
  food_drink: 'Food & Drink',
  transport: 'Transport',
};

const ActivityCarouselCard = ({
  activity,
  onPress,
  onLikePress,
}) => {
  const liked = activity.is_liked || false;
  const likesCount = activity.likes_count || 0;

  const imageSource =
    typeof activity.thumbnail === 'string' && activity.thumbnail
      ? { uri: activity.thumbnail }
      : defaultImage;

  const handleLike = () => {
    if (onLikePress) onLikePress(activity.id);
  };

  const priceText = activity.price && parseFloat(activity.price) > 0
    ? `€${activity.price}`
    : 'FREE';

  const providerText = activity.property_name || (activity.provided_by === 'partner' && activity.partner_name
    ? activity.partner_name
    : 'By the hostel');

  const typologyLabel = typologyLabels[activity.typology] || activity.typology || '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        {/* Typology badge top-left */}
        {typologyLabel ? (
          <View
            style={[
              styles.typologyBadge,
              { backgroundColor: activity.typology_color || '#6B7280' },
            ]}
          >
            <Text style={styles.typologyText} numberOfLines={1}>
              {typologyLabel}
            </Text>
          </View>
        ) : null}

        {/* Heart icon top-right */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleLike}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <HeartIcon size={18} filled={liked} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>
        <Text style={styles.provider} numberOfLines={1}>
          {providerText}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{priceText}</Text>
          {likesCount > 0 ? (
            <View style={styles.likesRow}>
              <HeartIcon size={12} filled={true} />
              <Text style={styles.likesCount}>{likesCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 12,
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typologyBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typologyText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 9,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 13,
    color: Colors.textBlack,
    lineHeight: 18,
    marginBottom: 2,
  },
  provider: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 11,
    color: Colors.textGray,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: Colors.textBlack,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesCount: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 11,
    color: Colors.textGray,
  },
});

export default ActivityCarouselCard;
