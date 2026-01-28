import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Colors, Fonts } from '../../constants/Constants';

const { width } = Dimensions.get('window');

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

const ActivityDetailScreen = ({ navigation, route }) => {
  const [commentText, setCommentText] = useState('');

  // Activity data (from route params or default)
  const activity = route?.params?.activity || {
    image: require('../../assets/images/bonfire.png'),
    title: 'Bonfire',
    category: 'Party',
    time: '8:00 PM - 5:00 AM',
    date: '12-01-2026',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has.',
    price: '$12',
    peopleJoined: 36,
  };

  // Send comment
  const handleSendComment = () => {
    if (commentText.trim()) {
      console.log('Send comment:', commentText);
      setCommentText('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              activity.image || require('../../assets/images/bonfire.png')
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
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{activity.title}</Text>

            <View style={styles.titleInfo}>
              {/* Location */}
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/map-pin.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>{activity.location}</Text>
              </View>

              {/* Age Range */}
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/users.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>{activity.ageRange}</Text>
              </View>

              {/* Category Tag */}
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>Party</Text>
              </View>
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
              <Text style={styles.infoText}>{activity.time}</Text>
            </View>

            {/* Date */}
            <View style={styles.infoItem}>
              <Image
                source={require('../../assets/images/icons/calendar-small.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>{activity.date}</Text>
            </View>

            {/* Open Map */}
            <TouchableOpacity style={styles.mapButton} activeOpacity={0.7}>
              <Image
                source={require('../../assets/images/icons/map.png')}
                style={styles.mapIcon}
                resizeMode="contain"
              />
              <Text style={styles.mapText}>Open Map</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{activity.description}</Text>

          {/* Price & People Row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{activity.price}</Text>
            <Text style={styles.peopleJoined}>
              {activity.peopleJoined} Peoples Joined
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.joinButton}
              activeOpacity={0.8}
              onPress={() => console.log('Request to Join')}
            >
              <Text style={styles.joinButtonText}>Request to Join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() => console.log('Join Chat')}
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
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment"
            placeholderTextColor={Colors.textLight}
            value={commentText}
            onChangeText={setCommentText}
          />
        </View>
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
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 22,
    color: Colors.primary,
    marginRight: 12,
  },
  titleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    fontFamily: Fonts.kantumruyRegular,
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
    fontFamily: Fonts.kantumruyMedium,
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
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // Description
  description: {
    fontFamily: Fonts.kantumruyRegular,
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
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.primary,
  },
  peopleJoined: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.textBlack,
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
    fontFamily: Fonts.kantumruyBold,
    fontSize: 12,
    color: Colors.white,
  },
  chatButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  chatButtonText: {
    fontFamily: Fonts.kantumruyBold,
    fontSize: 12,
    color: Colors.white,
  },

  // Comments Section
  commentsTitle: {
    fontFamily: Fonts.poppinsBold,
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
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 2,
  },
  commentText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textGray,
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
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderRadius:37
  },
  commentInput: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
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
