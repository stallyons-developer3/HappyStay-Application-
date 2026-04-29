import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { ACTIVITY } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { useBadgeCounts } from '../../context/BadgeContext';
import JoinActivityModal from '../../components/JoinActivityModal';
import HeartIcon from '../../components/common/HeartIcon';
import AvatarStack from '../../components/common/AvatarStack';
import Svg, { Path } from 'react-native-svg';

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

const formatTypology = value => {
  if (!value) return '';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ActivityDetailScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const { registerGroupChats } = useBadgeCounts();
  const { user } = useSelector(state => state.auth);
  const { activityId } = route.params || {};

  const [activity, setActivity] = useState(null);
  const [comments, setComments] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);

  const scrollViewRef = React.useRef(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

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
    fetchActivityDetail();
    fetchComments();
    fetchChatMessages();
  }, [activityId]);

  const fetchActivityDetail = async () => {
    try {
      const response = await api.get(ACTIVITY.GET_DETAIL(activityId));
      if (response.data?.activity) {
        setActivity(response.data.activity);
        setIsLiked(response.data.activity.is_liked || false);
        setLikesCount(response.data.activity.likes_count || 0);
        setIsInterested(response.data.activity.is_interested || false);
        setInterestedCount(response.data.activity.interested_count || 0);
      }
    } catch (error) {
      showToast('error', 'Failed to load activity details');
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
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await api.get(ACTIVITY.GET_CHAT(activityId));
      if (response.data?.messages) {
        const latestTwo = response.data.messages.slice(0, 2).reverse();
        setChatMessages(latestTwo);
      }
    } catch (error) {
      // Silently fail — user may not have access to chat
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchActivityDetail(),
      fetchComments(),
      fetchChatMessages(),
    ]);
    setRefreshing(false);
  }, [activityId]);

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
      showToast('error', 'Failed to send comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleJoinRequest = async (seats) => {
    const seatCount = seats || selectedSeats;
    setIsJoining(true);
    try {
      const response = await api.post(ACTIVITY.SEND_REQUEST(activityId), {
        seats: seatCount,
      });
      const newStatus = response.data?.request_status
        || (activity?.is_private ? 'pending' : 'accepted');
      showToast('success', response.data?.message || 'Request sent!');
      setActivity(prev => ({
        ...prev,
        user_request_status: newStatus,
        joined_count:
          newStatus === 'accepted'
            ? (prev.joined_count || 0) + seatCount
            : prev.joined_count,
      }));
      // Subscribe to this chat's Pusher channel immediately so the bottom-nav
      // bubble updates in real-time even before the user opens the chat
      if (newStatus === 'accepted') {
        registerGroupChats([{ type: 'activity', id: activityId }]);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      showToast('info', msg);
    } finally {
      setIsJoining(false);
    }
  };

  const isOwner = activity?.created_by === user?.id;

  const canJoinActivity = (() => {
    if (!user?.property || !user?.check_in || !user?.check_out) {
      return { canJoin: false, message: 'No active booking' };
    }
    if (activity?.start_date) {
      const actStart = activity.start_date.slice(0, 10);
      const actEnd = (activity.end_date || activity.start_date).slice(0, 10);
      const checkIn = user.check_in.slice(0, 10);
      const checkOut = user.check_out.slice(0, 10);
      if (actEnd < checkIn || actStart > checkOut) {
        return { canJoin: false, message: 'Outside trip dates' };
      }
    }
    return { canJoin: true, message: '' };
  })();

  const handleLikePress = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await api.post(ACTIVITY.TOGGLE_LIKE(activity.id));
    } catch (e) {
      // Revert on error
      setIsLiked(!newLiked);
      setLikesCount(prev => (newLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleWhatsAppPress = async () => {
    if (!activity?.partner_whatsapp) return;
    try {
      await api.post(ACTIVITY.WHATSAPP_CLICK(activity.id));
    } catch (e) {}
    const phone = activity.partner_whatsapp.replace(/[^0-9]/g, '');
    const propertyName = user?.property?.name || 'the hostel';
    const activityName = activity.title || 'an activity';
    const dateInfo = activity.activity_type === 'open' && activity.schedule_text
      ? activity.schedule_text
      : activity.start_date
        ? activity.start_date + (activity.end_date && activity.end_date !== activity.start_date ? ' to ' + activity.end_date : '')
        : '';
    const datePart = dateInfo ? ` on ${dateInfo}` : '';
    const message = encodeURIComponent(`Hi! I'm a guest at ${propertyName} and I'd like to join the activity "${activityName}"${datePart}.`);
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const handleToggleInterest = async () => {
    // Optimistic update
    setIsInterested(prev => !prev);
    setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
    try {
      await api.post(ACTIVITY.TOGGLE_INTEREST(activity.id));
    } catch (e) {
      // Revert
      setIsInterested(prev => !prev);
      setInterestedCount(prev => isInterested ? prev + 1 : prev - 1);
    }
  };

  const getJoinButtonText = () => {
    if (isJoining) return 'Sending...';
    if (!activity) return 'Join';
    if (!canJoinActivity.canJoin) return canJoinActivity.message;
    switch (activity.user_request_status) {
      case 'pending':
        return 'Request Pending';
      case 'accepted':
        return 'Joined';
      default:
        return activity.is_private ? 'Request to Join' : 'Join';
    }
  };

  const isJoinDisabled =
    isJoining ||
    isOwner ||
    !canJoinActivity.canJoin ||
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

  const ageRange = activity.min_age ? `+${activity.min_age}` : null;

  const timeDisplay = activity.all_day
    ? 'All Day'
    : [formatTime(activity.start_time), formatTime(activity.end_time)]
        .filter(Boolean)
        .join(' - ');

  const dateDisplay = (() => {
    const start = formatDate(activity.start_date);
    const end = formatDate(activity.end_date);
    if (start && end && start !== end) return `${start}  —  ${end}`;
    return start || '';
  })();

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
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
            <Text style={styles.title}>{activity.title}</Text>

            {activity.typology && (
              <View style={[styles.categoryTag, activity.typology_color && { backgroundColor: activity.typology_color }]}>
                <Text style={styles.categoryText}>
                  {formatTypology(activity.typology)}
                </Text>
              </View>
            )}
          </View>

          {activity.provided_by && (
            <View style={styles.providedByRow}>
              <View style={styles.providedByTag}>
                <Text style={styles.providedByText}>
                  {activity.provided_by === 'partner' && activity.partner_name
                    ? `Organized by ${activity.partner_name}`
                    : activity.provided_by === 'partner'
                    ? 'By a hostel partner'
                    : 'By the hostel'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={handleLikePress}
                activeOpacity={0.7}
              >
                <HeartIcon size={22} filled={isLiked} />
                {likesCount > 0 ? (
                  <Text style={styles.likeCount}>{likesCount}</Text>
                ) : null}
              </TouchableOpacity>
            </View>
          )}

          {activity.location && (
            <View style={styles.locationRow}>
              <Image
                source={require('../../assets/images/icons/map-pin.png')}
                style={[styles.infoIcon, { marginTop: 2 }]}
                resizeMode="contain"
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {activity.location}
              </Text>
            </View>
          )}

          {activity.meeting_point && (
            <View style={styles.locationRow}>
              <Image
                source={require('../../assets/images/icons/map-pin.png')}
                style={[styles.infoIcon, { marginTop: 2, tintColor: '#3B82F6' }]}
                resizeMode="contain"
              />
              <Text style={[styles.locationText, { color: '#3B82F6' }]} numberOfLines={2}>
                Meeting: {activity.meeting_point}
              </Text>
            </View>
          )}

          {ageRange && (
            <View style={[styles.infoItem, { marginBottom: 12 }]}>
              <Image
                source={require('../../assets/images/icons/users.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>{ageRange}</Text>
            </View>
          )}

          {(activity.min_guests || activity.max_guests) && (
            <View style={[styles.infoItem, { marginBottom: 12 }]}>
              <Image
                source={require('../../assets/images/icons/users.png')}
                style={styles.infoIcon}
                resizeMode="contain"
              />
              <Text style={styles.infoText}>
                {activity.min_guests && activity.max_guests
                  ? `${activity.min_guests} - ${activity.max_guests} Guests`
                  : activity.min_guests
                  ? `Min ${activity.min_guests} Guests`
                  : `Max ${activity.max_guests} Guests`}
              </Text>
            </View>
          )}

          <View style={styles.timeRow}>
            {activity.activity_type === 'open' && activity.schedule_text ? (
              <View style={styles.infoItem}>
                <Image
                  source={require('../../assets/images/icons/calendar-small.png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>{activity.schedule_text}</Text>
              </View>
            ) : (
              <>
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

                {dateDisplay ? (
                  <View style={styles.infoItem}>
                    <Image
                      source={require('../../assets/images/icons/calendar-small.png')}
                      style={styles.infoIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.infoText}>
                      {dateDisplay}
                    </Text>
                  </View>
                ) : null}
              </>
            )}

            {activity.map_url && (
              <TouchableOpacity
                style={styles.mapButton}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(Screens.LocationMap, {
                    latitude: activity.latitude,
                    longitude: activity.longitude,
                    title: activity.title,
                    location: activity.location,
                    markerColor: activity.typology_color,
                  })
                }
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

          {activity?.partner_email ? (
            <TouchableOpacity style={[styles.infoItem, { marginBottom: 10 }]} activeOpacity={0.7}
              onPress={() => Linking.openURL(`mailto:${activity.partner_email}`)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M22 6l-10 7L2 6" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.infoText, { color: Colors.primary, textDecorationLine: 'underline' }]}>{activity.partner_email}</Text>
            </TouchableOpacity>
          ) : null}
          {activity?.partner_phone ? (
            <TouchableOpacity style={[styles.infoItem, { marginBottom: 10 }]} activeOpacity={0.7}
              onPress={() => Linking.openURL(`tel:${activity.partner_phone}`)}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={[styles.infoText, { color: Colors.primary, textDecorationLine: 'underline' }]}>{activity.partner_phone}</Text>
            </TouchableOpacity>
          ) : null}

          {activity.description ? (
            <Text style={styles.description}>{activity.description}</Text>
          ) : null}

          {activity.activity_type === 'event' && interestedCount > 0 && (
            <View style={styles.interestedAboveRow}>
              <Text style={styles.interestedCount}>
                {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {activity.price && parseFloat(activity.price) > 0
                ? `€${activity.price}${activity.price_type === 'per_person' ? '/person' : activity.price_type === 'per_hour' ? '/hour' : ''}`
                : 'FREE'}
            </Text>
            {activity.activity_type === 'event' ? (
              <View style={styles.joinedRow}>
                <AvatarStack
                  images={activity.people_images || []}
                  maxDisplay={3}
                  size={28}
                  overlap={8}
                />
                <Text style={styles.peopleJoined}>
                  {activity.joined_count || 0} People Joined
                </Text>
              </View>
            ) : interestedCount > 0 ? (
              <Text style={styles.interestedCount}>
                {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested
              </Text>
            ) : null}
          </View>

          <View style={styles.actionButtons}>
            {/* Row 1: WhatsApp + I'm Interested side by side */}
            <View style={styles.actionRowSplit}>
              {activity?.partner_whatsapp ? (
                <TouchableOpacity style={[styles.whatsappButton, { flex: 1, marginRight: 8 }]} activeOpacity={0.8} onPress={handleWhatsAppPress}>
                  <Text style={styles.whatsappButtonText}>book via whatsapp</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.interestedButton, isInterested && styles.interestedButtonActive, { flex: 1 }]}
                activeOpacity={0.8}
                onPress={handleToggleInterest}
              >
                <Text style={[styles.interestedButtonText, isInterested && styles.interestedButtonTextActive]} numberOfLines={1}>
                  {isInterested ? 'interested' : "i'm interested"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Join button (event only) */}
            {activity.activity_type === 'event' && (
              <TouchableOpacity
                style={[styles.joinButton, isJoinDisabled && styles.disabledButton]}
                activeOpacity={0.8}
                onPress={() => { setSelectedSeats(1); setShowJoinModal(true); }}
                disabled={isJoinDisabled}
              >
                <Text style={styles.joinButtonText}>{getJoinButtonText()}</Text>
              </TouchableOpacity>
            )}

          </View>

          {/* Chat Preview - last 2 messages (event activities only) */}
          {activity.activity_type === 'event' && (isOwner || activity?.user_request_status === 'accepted') && chatMessages.length > 0 && (
            <View style={styles.chatPreview}>
              {chatMessages.map(msg => (
                <View key={`chat-${msg.id}`} style={styles.chatPreviewItem}>
                  {msg.user?.profile_picture ? (
                    <Image
                      source={{ uri: msg.user.profile_picture }}
                      style={styles.chatPreviewAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.chatPreviewInitial}>
                      <Text style={styles.chatPreviewInitialText}>
                        {getInitial(msg.user?.name)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.chatPreviewText} numberOfLines={1}>
                    <Text style={styles.chatPreviewName}>{msg.user?.name || 'User'}: </Text>
                    {msg.message}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {activity?.activity_type === 'event' && (
        <JoinActivityModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onConfirm={seats => {
            setSelectedSeats(seats);
            setShowJoinModal(false);
            handleJoinRequest(seats);
          }}
          price={activity?.price}
          isPrivate={activity?.is_private}
          loading={isJoining}
          maxGuests={activity?.max_guests}
          joinedCount={activity?.joined_count}
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
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    flex: 1,
    marginRight: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    flex: 1,
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
  providedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  providedByTag: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  providedByText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
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
    marginTop: 6,
    marginBottom: 10,
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
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peopleJoined: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.primary,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeCount: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatsLabel: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
    marginRight: 12,
  },
  seatsSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  seatOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatOptionSelected: {
    backgroundColor: Colors.primary,
  },
  seatOptionText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
  },
  seatOptionTextSelected: {
    color: Colors.white,
  },
  actionButtons: {
    marginBottom: 24,
    gap: 10,
  },
  actionRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 11,
    color: '#fff',
    textTransform: 'lowercase',
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
  interestedButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestedButtonActive: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  interestedButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 11,
    color: Colors.white,
  },
  interestedButtonTextActive: {
    color: Colors.primary,
  },
  interestedCount: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.primary,
    marginTop: 8,
  },
  interestedAboveRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  chatPreview: {
    marginTop: 8,
    marginBottom: 16,
  },
  chatPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatPreviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  chatPreviewInitial: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chatPreviewInitialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: Colors.white,
  },
  chatPreviewText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    flex: 1,
  },
  chatPreviewName: {
    fontFamily: Fonts.RobotoBold,
    color: Colors.textBlack,
  },
});

export default ActivityDetailScreen;
