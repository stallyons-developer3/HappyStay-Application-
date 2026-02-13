import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { ACTIVITY } from '../../api/endpoints';

const { width } = Dimensions.get('window');
const INPUT_WIDTH = width - 40 - 48 - 12;

const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatTime = timeStr => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const mins = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
};

const getInitial = name => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const ActivityDetailScreen = ({ navigation, route }) => {
  const { activityId } = route.params || {};

  const [activity, setActivity] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchActivityDetail();
    fetchComments();
  }, [activityId]);

  const fetchActivityDetail = async () => {
    try {
      const response = await api.get(ACTIVITY.GET_DETAIL(activityId));
      if (response.data?.activity) {
        setActivity(response.data.activity);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load activity details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(ACTIVITY.GET_COMMENTS(activityId));
      if (response.data?.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.log('Comments error:', error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      const response = await api.post(ACTIVITY.ADD_COMMENT(activityId), {
        comment: commentText.trim(),
      });
      if (response.data?.comment) {
        setComments(prev => [response.data.comment, ...prev]);
        setCommentText('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinRequest = async () => {
    setIsJoining(true);
    try {
      const response = await api.post(ACTIVITY.SEND_REQUEST(activityId));
      Alert.alert('Success', response.data?.message || 'Request sent!');
      setActivity(prev => ({ ...prev, user_request_status: 'pending' }));
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      Alert.alert('Info', msg);
    } finally {
      setIsJoining(false);
    }
  };

  const getJoinButtonText = () => {
    if (isJoining) return 'Sending...';
    if (!activity) return 'Request to Join';
    switch (activity.user_request_status) {
      case 'pending':
        return 'Request Pending';
      case 'accepted':
        return 'Joined';
      case 'declined':
        return 'Declined';
      default:
        return 'Request to Join';
    }
  };

  const isJoinDisabled =
    isJoining ||
    activity?.user_request_status === 'pending' ||
    activity?.user_request_status === 'accepted';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Activity not found</Text>
      </View>
    );
  }

  const heroImage = activity.thumbnail
    ? { uri: activity.thumbnail }
    : require('../../assets/images/bonfire.png');

  const ageRange =
    activity.min_age && activity.max_age
      ? `${activity.min_age}-${activity.max_age}`
      : null;

  const timeDisplay = [
    formatTime(activity.start_time),
    formatTime(activity.end_time),
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={heroImage}
            style={styles.heroImage}
            resizeMode="cover"
          />
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

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.title}>{activity.title}</Text>

              {activity.location && (
                <View style={styles.infoItem}>
                  <Image
                    source={require('../../assets/images/icons/map-pin.png')}
                    style={styles.infoIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.infoText}>{activity.location}</Text>
                </View>
              )}

              {ageRange && (
                <View style={styles.infoItem}>
                  <Image
                    source={require('../../assets/images/icons/users.png')}
                    style={styles.infoIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.infoText}>{ageRange}</Text>
                </View>
              )}
            </View>

            {activity.typology && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{activity.typology}</Text>
              </View>
            )}
          </View>

          <View style={styles.timeRow}>
            {timeDisplay ? (
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/clock.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>{timeDisplay}</Text>
              </View>
            ) : null}

            {activity.start_date && (
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/calendar-small.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>
                  {formatDate(activity.start_date)}
                </Text>
              </View>
            )}

            {activity.map_url && (
              <TouchableOpacity
                style={styles.mapButton}
                activeOpacity={0.7}
                onPress={() => Linking.openURL(activity.map_url)}
              >
                <Image
                  source={require('../../assets/images/icons/map-card.png')}
                  style={styles.mapIconSmall}
                  resizeMode="contain"
                />
                <Text style={styles.mapTextSmall}>Open Map</Text>
              </TouchableOpacity>
            )}
          </View>

          {activity.description ? (
            <Text style={styles.description}>{activity.description}</Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {activity.price ? `$${activity.price}` : 'Free'}
            </Text>
            <Text style={styles.peopleJoined}>
              {activity.joined_count || 0} People Joined
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.joinButton,
                isJoinDisabled && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              onPress={handleJoinRequest}
              disabled={isJoinDisabled}
            >
              <Text style={styles.joinButtonText}>{getJoinButtonText()}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(Screens.ChatDetail, {
                  activityId: activity.id,
                  title: activity.title,
                })
              }
            >
              <Text style={styles.chatButtonText}>Join Chat</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.commentsTitle}>Comments</Text>

          {comments.length === 0 && (
            <Text style={styles.noComments}>No comments yet</Text>
          )}

          {comments.map(comment => {
            const hasAvatar = comment.user?.profile_picture;
            return (
              <View key={comment.id} style={styles.commentItem}>
                {hasAvatar ? (
                  <Image
                    source={{ uri: comment.user.profile_picture }}
                    style={styles.commentAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.commentInitialCircle}>
                    <Text style={styles.commentInitialText}>
                      {getInitial(comment.user?.name)}
                    </Text>
                  </View>
                )}
                <View style={styles.commentBubble}>
                  <Text style={styles.commentName}>
                    {comment.user?.name || 'User'}
                  </Text>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

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
          style={[styles.sendButton, isSending && { opacity: 0.6 }]}
          onPress={handleSendComment}
          activeOpacity={0.8}
          disabled={isSending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  errorText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textGray,
  },
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIconSmall: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    marginRight: 4,
  },
  mapTextSmall: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.primary,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 20,
  },
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
  disabledButton: {
    opacity: 0.6,
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
  commentsTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 16,
  },
  noComments: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
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
  commentInitialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentInitialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.white,
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
