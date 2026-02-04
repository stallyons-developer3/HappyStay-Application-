import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Colors, Fonts, Screens } from '../../constants/Constants';

const { width } = Dimensions.get('window');

// Calculate input width: screen - paddingHorizontal(40) - sendButton(48) - gap(12)
const INPUT_WIDTH = width - 40 - 48 - 12;

// Dummy Comments Data
const commentsData = [
  {
    id: '1',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jane Doe',
    comment: 'interested',
  },
  {
    id: '2',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jane Doe',
    comment: 'Lets Join Chat',
  },
];

const ActivityDetailScreen = ({ navigation }) => {
  const [commentText, setCommentText] = useState('');

  // Send comment
  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log('Send comment:', commentText);
      setCommentText('');
    }
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
            source={require('../../assets/images/bonfire.png')}
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

            {/* Category Tag - Right Aligned */}
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>Party</Text>
            </View>
          </View>

          {/* Time & Date Row */}
          <View style={styles.timeRow}>
            {/* Time */}
            <View style={styles.infoItem}>
              <Image
                source={require('../../assets/images/icons/clock.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>8:00 PM - 5:00 AM</Text>
            </View>

            {/* Date */}
            <View style={styles.infoItem}>
              <Image
                source={require('../../assets/images/icons/calendar-small.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>12-01-2026</Text>
            </View>

            {/* Open Map */}
            <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
              <Image
                source={require('../../assets/images/icons/map-card.png')}
                style={styles.mapIcon}
                resizeMode="contain"
              />
              <Text style={styles.mapText}>Open Map</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has.
          </Text>

          {/* Price & People Row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>$12</Text>
            <Text style={styles.peopleJoined}>36 People Joined</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.joinButton}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>Request to Join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Screens.ChatDetail)}
            >
              <Text style={styles.chatButtonText}>Join Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <Text style={styles.commentsTitle}>Comments</Text>

          {/* Comment Items */}
          {commentsData.map(comment => (
            <View key={comment.id} style={styles.commentItem}>
              <Image
                source={comment.profileImage}
                style={styles.commentAvatar}
                resizeMode="cover"
              />
              <View style={styles.commentBubble}>
                <Text style={styles.commentName}>{comment.name}</Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment Input - Fixed at Bottom */}
      <View style={styles.commentInputContainer}>
        <Shadow
          distance={8}
          startColor="rgba(0, 0, 0, 0.06)"
          endColor="rgba(0, 0, 0, 0)"
          offset={[0, 0]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment"
              placeholderTextColor={Colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
            />
          </View>
        </Shadow>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendComment}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/images/icons/send.png')}
            style={styles.sendIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
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
    paddingBottom: 100,
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
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
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
    paddingTop: 20,
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
    marginRight: 12,
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
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },

  // Description
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Price Row
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
  },
  peopleJoined: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.primary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 12,
  },
  joinButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.white,
    textTransform: 'lowercase',
  },
  chatButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  chatButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.white,
    textTransform: 'lowercase',
  },

  // Comments Section
  commentsTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentBubble: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    maxWidth: width - 100,
  },
  commentName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 2,
  },
  commentText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: '#23232380',
  },

  // Comment Input
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    width: INPUT_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 37,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
  },
  commentInput: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    padding: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
  },
});

export default ActivityDetailScreen;
