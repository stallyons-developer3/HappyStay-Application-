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
  Linking,
  Platform,
  Keyboard,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { HANGOUT } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');
const INPUT_WIDTH = width - 40 - 48 - 12;

const formatTime = timeStr => {
  if (!timeStr) return '';
  // If already has AM/PM, return as-is
  if (/am|pm/i.test(timeStr)) return timeStr.trim();
  // Otherwise parse HH:MM and add AM/PM
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

const formatDateDisplay = dateStr => {
  if (!dateStr) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const d = new Date(dateStr);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const getTimeAgo = dateStr => {
  if (!dateStr) return '';
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const HangoutDetailScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const { hangoutId } = route.params || {};
  const { user } = useSelector(state => state.auth);

  const [hangout, setHangout] = useState(null);
  const [comments, setComments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const scrollViewRef = React.useRef(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  const isOwner = hangout?.user?.id === user?.id;
  const isPublic = hangout ? !hangout.is_private : false;

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    fetchHangoutDetail();
    fetchComments();
  }, [hangoutId]);

  useEffect(() => {
    if (isOwner && hangoutId) {
      fetchRequests();
    }
  }, [isOwner, hangoutId]);

  const fetchHangoutDetail = async () => {
    try {
      const response = await api.get(HANGOUT.GET_DETAIL(hangoutId));
      if (response.data?.hangout) {
        setHangout(response.data.hangout);
      }
    } catch (error) {
      showToast('error', 'Failed to load hangout details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(HANGOUT.GET_COMMENTS(hangoutId));
      if (response.data?.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.log('Comments error:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get(HANGOUT.GET_REQUESTS(hangoutId));
      if (response.data?.requests) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.log('Requests error:', error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      const response = await api.post(HANGOUT.ADD_COMMENT(hangoutId), {
        comment: commentText.trim(),
      });
      if (response.data?.comment) {
        setComments(prev => [response.data.comment, ...prev]);
        setCommentText('');
      }
    } catch (error) {
      showToast('error', 'Failed to send comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinRequest = async () => {
    setIsJoining(true);
    try {
      const response = await api.post(HANGOUT.SEND_REQUEST(hangoutId));
      showToast('success', response.data?.message || 'Request sent!');
      setHangout(prev => ({ ...prev, user_request_status: 'pending' }));
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      showToast('info', msg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    const status = action === 'accept' ? 'accepted' : 'declined';
    try {
      const response = await api.post(HANGOUT.RESPOND_REQUEST(requestId), {
        status,
      });
      showToast('success', response.data?.message || `Request ${status}`);
      setRequests(prev =>
        prev.map(r => (r.id === requestId ? { ...r, status } : r)),
      );
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Action failed');
    }
  };

  const getJoinButtonText = () => {
    if (isJoining) return 'Sending...';
    if (isOwner) return 'Your Hangout';
    if (!hangout) return 'Request to Join';
    switch (hangout.user_request_status) {
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
    isOwner ||
    hangout?.user_request_status === 'pending' ||
    hangout?.user_request_status === 'accepted';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hangout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Hangout not found</Text>
      </View>
    );
  }

  const ownerImage = hangout.user?.profile_picture;
  const ageRange =
    hangout.min_age && hangout.max_age
      ? `${hangout.min_age}-${hangout.max_age}`
      : null;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
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

          <View style={styles.imageContainer}>
            {ownerImage ? (
              <Image
                source={{ uri: ownerImage }}
                style={styles.hangoutImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.ownerInitialCircle}>
                <Text style={styles.ownerInitialText}>
                  {getInitial(hangout.user?.name)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.ownerName}>{hangout.user?.name || 'User'}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {hangout.title}
            </Text>

            {hangout.typology && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{hangout.typology}</Text>
              </View>
            )}
          </View>

          {hangout.location && (
            <View style={styles.infoItem}>
              <Image
                source={require('../../assets/images/icons/map-pin.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText} numberOfLines={2}>
                {hangout.location}
              </Text>
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

          <View style={styles.timeRow}>
            {hangout.time && (
              <>
                <Image
                  source={require('../../assets/images/icons/clock.png')}
                  style={styles.timeIcon}
                  resizeMode="contain"
                />
                <Text style={styles.timeText}>{formatTime(hangout.time)}</Text>
              </>
            )}

            {hangout.map_url && (
              <TouchableOpacity
                style={styles.mapLinkButton}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(Screens.LocationMap, {
                    latitude: hangout.latitude,
                    longitude: hangout.longitude,
                    title: hangout.title,
                    location: hangout.location,
                  })
                }
              >
                <Image
                  source={require('../../assets/images/icons/map-card.png')}
                  style={styles.mapIconSmall}
                  resizeMode="contain"
                />
                <Text style={styles.mapLinkText}>Open Map</Text>
              </TouchableOpacity>
            )}
          </View>

          {hangout.description ? (
            <Text style={styles.description}>{hangout.description}</Text>
          ) : null}

          <Text style={styles.peopleJoined}>
            {hangout.joined_count || 0}{' '}
            {(hangout.joined_count || 0) === 1 ? 'Person' : 'People'} Joined
          </Text>

          <View style={styles.actionButtons}>
            {!isOwner && !isPublic && (
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
            )}

            <TouchableOpacity
              style={[styles.chatButton, (isOwner || isPublic) && { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(Screens.ChatDetail, {
                  hangoutId: hangout.id,
                  title: hangout.title,
                })
              }
            >
              <Text style={styles.chatButtonText}>
                {isOwner ? 'Chat' : 'Join Chat'}
              </Text>
            </TouchableOpacity>
          </View>

          {isOwner && pendingRequests.length > 0 && (
            <>
              <Text style={styles.requestsTitle}>Requests</Text>
              {pendingRequests.map(req => {
                const hasReqAvatar = req.user?.profile_picture;
                return (
                  <View key={req.id} style={styles.requestItem}>
                    {hasReqAvatar ? (
                      <Image
                        source={{ uri: req.user.profile_picture }}
                        style={styles.requestProfile}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.requestInitialCircle}>
                        <Text style={styles.requestInitialText}>
                          {getInitial(req.user?.name)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>
                        {req.user?.name || 'User'}
                      </Text>
                      <Text style={styles.requestDate}>
                        {formatDateDisplay(req.created_at)}
                      </Text>
                      <Text style={styles.requestDate}>
                        {getTimeAgo(req.created_at)}
                      </Text>
                    </View>

                    <View style={styles.requestButtons}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        activeOpacity={0.8}
                        onPress={() => handleRespondRequest(req.id, 'accept')}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.declineButton}
                        activeOpacity={0.8}
                        onPress={() => handleRespondRequest(req.id, 'decline')}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          )}

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

      <View
        style={[
          styles.commentInputContainer,
          Platform.OS === 'android' &&
            keyboardHeight > 0 && { paddingBottom: keyboardHeight + 16 },
        ]}
      >
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
    paddingBottom: 20,
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
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    overflow: 'hidden',
  },
  hangoutImage: {
    width: '100%',
    height: '100%',
  },
  ownerInitialCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerInitialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 48,
    color: Colors.white,
  },
  ownerName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.white,
    marginTop: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    flex: 1,
    marginRight: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.primary,
    marginRight: 6,
  },
  infoText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textGray,
    flex: 1,
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
    marginRight: 16,
  },
  mapLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapIconSmall: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
    marginRight: 4,
  },
  mapLinkText: {
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
  peopleJoined: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
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
  requestsTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 16,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestProfile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  requestInitialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInitialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.white,
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
    alignItems: 'flex-start',
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

export default HangoutDetailScreen;
