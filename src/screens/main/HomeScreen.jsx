import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Image,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL, HANGOUT, ACTIVITY, POST as POST_API } from '../../api/endpoints';
import api from '../../api/axiosInstance';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ActivityCard from '../../components/ActivityCard';
import HangoutCard from '../../components/HangoutCard';
import PromotionCard from '../../components/PromotionCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';
import JoinActivityModal from '../../components/JoinActivityModal';

import { fetchHomeData } from '../../store/slices/homeSlice';
import { setUser } from '../../store/slices/authSlice';
import { PROFILE } from '../../api/endpoints';
import { saveUserData } from '../../utils/storage';
import { useBadgeCounts } from '../../context/BadgeContext';
import { useToast } from '../../context/ToastContext';

const formatDate = dateStr => {
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
  return `${d.getDate()} ${months[d.getMonth()]}`;
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning!';
  if (hour < 17) return 'Good Afternoon!';
  return 'Good Evening!';
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { activities, hangouts, posts, isLoading } = useSelector(
    state => state.home,
  );
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();
  const { showToast } = useToast();
  const [joiningId, setJoiningId] = useState(null);
  const [joiningActivityId, setJoiningActivityId] = useState(null);
  const [postLikeOverrides, setPostLikeOverrides] = useState({});
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalActivity, setJoinModalActivity] = useState(null);

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const canJoinActivity = activity => {
    if (!user?.property || !user?.check_in || !user?.check_out) {
      return { canJoin: false, message: 'No active booking' };
    }
    if (activity.start_date) {
      const actStart = activity.start_date.slice(0, 10);
      const actEnd = (activity.end_date || activity.start_date).slice(0, 10);
      const checkIn = user.check_in.slice(0, 10);
      const checkOut = user.check_out.slice(0, 10);
      if (actEnd < checkIn || actStart > checkOut) {
        return { canJoin: false, message: 'Outside trip dates' };
      }
    }
    return { canJoin: true, message: '' };
  };

  const canJoinHangout = hangout => {
    if (!user?.property || !user?.check_in || !user?.check_out) {
      return { canJoin: false, message: 'No active booking' };
    }
    if (hangout.date) {
      const hDate = hangout.date.slice(0, 10);
      const checkIn = user.check_in.slice(0, 10);
      const checkOut = user.check_out.slice(0, 10);
      if (hDate < checkIn || hDate > checkOut) {
        return { canJoin: false, message: 'Outside trip dates' };
      }
    }
    return { canJoin: true, message: '' };
  };

  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [filtering, setFiltering] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchHomeData());
      // Refresh user profile to pick up property assignment changes
      api.get(PROFILE.GET_PROFILE).then(res => {
        if (res.data?.success && res.data?.user) {
          dispatch(setUser(res.data.user));
          saveUserData(res.data.user);
        }
      }).catch(() => {});
    }, [dispatch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const params = { ...activeFilters };
    if (searchText.trim()) params.search = searchText.trim();
    await Promise.all([
      dispatch(fetchHomeData(params)),
      api.get(PROFILE.GET_PROFILE).then(res => {
        if (res.data?.success && res.data?.user) {
          dispatch(setUser(res.data.user));
          saveUserData(res.data.user);
        }
      }).catch(() => {}),
    ]);
    setRefreshing(false);
  }, [dispatch, activeFilters, searchText]);

  const handleSearch = async () => {
    const params = { ...activeFilters };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setFiltering(true);
    await dispatch(fetchHomeData(params));
    setFiltering(false);
  };

  const handleFilterApply = async filterParams => {
    const params = { ...filterParams };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setActiveFilters(filterParams);
    setFiltering(true);
    await dispatch(fetchHomeData(params));
    setFiltering(false);
  };

  const buildFeed = () => {
    const feed = [];

    const pinnedPosts = posts.filter(p => p.is_pinned);
    const normalPosts = posts.filter(p => !p.is_pinned);

    pinnedPosts.forEach(post => {
      feed.push({ type: 'post', data: post });
    });

    const maxLen = Math.max(
      activities.length,
      hangouts.length,
      normalPosts.length,
    );

    for (let i = 0; i < maxLen; i++) {
      if (i < activities.length) {
        feed.push({ type: 'activity', data: activities[i] });
      }
      if (i < hangouts.length) {
        feed.push({ type: 'hangout', data: hangouts[i] });
      }
      if (i < normalPosts.length) {
        feed.push({ type: 'post', data: normalPosts[i] });
      }
    }

    return feed;
  };

  const handleJoinRequest = async hangoutId => {
    setJoiningId(hangoutId);
    try {
      const response = await api.post(HANGOUT.SEND_REQUEST(hangoutId));
      showToast('success', response.data?.message || 'Request sent!');
      dispatch(fetchHomeData());
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      showToast('info', msg);
    } finally {
      setJoiningId(null);
    }
  };

  const handleWhatsAppPress = async (activity) => {
    if (!activity.partner_whatsapp) return;
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

  const handlePostLike = (postId) => {
    setPostLikeOverrides(prev => {
      const current = prev[postId];
      const post = posts.find(p => p.id === postId);
      const wasLiked = current !== undefined ? current.is_liked : (post?.is_liked || false);
      const wasCount = current !== undefined ? current.likes_count : (post?.likes_count || 0);
      const newLiked = !wasLiked;
      return {
        ...prev,
        [postId]: {
          is_liked: newLiked,
          likes_count: newLiked ? wasCount + 1 : Math.max(0, wasCount - 1),
        },
      };
    });
    api.post(POST_API.TOGGLE_LIKE(postId)).catch(() => {
      // Revert on error
      setPostLikeOverrides(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
    });
  };

  const openJoinModal = activity => {
    setJoinModalActivity(activity);
    setShowJoinModal(true);
  };

  const handleActivityJoin = async (activityId, seats = 1) => {
    setShowJoinModal(false);
    setJoiningActivityId(activityId);
    try {
      const response = await api.post(ACTIVITY.SEND_REQUEST(activityId), { seats });
      showToast('success', response.data?.message || 'Request sent!');
      dispatch(fetchHomeData());
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      showToast('info', msg);
    } finally {
      setJoiningActivityId(null);
      setJoinModalActivity(null);
    }
  };

  const profileImage = user?.profile_picture
    ? {
        uri: user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/${user.profile_picture}`,
      }
    : undefined;

  const feed = buildFeed();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={30}
          />
        }
      >
        <Header
          title="Home"
          greeting={getGreeting()}
          showGreeting={true}
          showProfile={true}
          showNotification={true}
          notificationCount={notificationCount}
          profileImage={profileImage}
          onProfilePress={() => navigation.navigate(Screens.Profile)}
          onNotificationPress={() => navigation.navigate(Screens.Notification)}
        />

        <SearchBar
          placeholder="Find your activity"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={handleSearch}
          onActionPress={() => setShowFilterModal(true)}
        />

        {(isLoading || filtering) && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : !user?.property && user?.has_pending_trip ? (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingTitle}>Almost there!</Text>
            <Text style={styles.pendingText}>
              We're verifying your access to this community. You'll get full
              access to Hangouts and events as soon as the hostel confirms your
              stay.
            </Text>
          </View>
        ) : feed.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No content available</Text>
          </View>
        ) : null}

        <View style={styles.feedGap} />

        {!isLoading &&
          !filtering &&
          feed.map((item, index) => {
            if (item.type === 'activity') {
              const a = item.data;
              const joinCheck = canJoinActivity(a);
              return (
                <View key={`activity-${a.id}`}>
                  <ActivityCard
                    image={a.thumbnail}
                    title={a.title}
                    price={a.price && parseFloat(a.price) > 0 ? `€${a.price}${a.price_type === 'per_person' ? '/person' : a.price_type === 'per_hour' ? '/hour' : ''}` : 'FREE'}
                    description={a.description}
                    time={
                      a.all_day
                        ? 'All Day'
                        : formatTime(a.start_time) +
                          (a.end_time ? ' - ' + formatTime(a.end_time) : '')
                    }
                    date={
                      formatDate(a.start_date) +
                      (a.end_date && a.end_date !== a.start_date
                        ? ' - ' + formatDate(a.end_date)
                        : '')
                    }
                    location={a.location || ''}
                    onPress={() =>
                      navigation.navigate(Screens.ActivityDetail, {
                        activityId: a.id,
                      })
                    }
                    onMapPress={() => {
                      if (a.latitude && a.longitude) {
                        navigation.navigate(Screens.LocationMap, {
                          latitude: a.latitude,
                          longitude: a.longitude,
                          title: a.title,
                          location: a.location,
                        });
                      }
                    }}
                    isOwner={a.created_by === user?.id}
                    isPrivate={a.is_private}
                    requestStatus={a.user_request_status}
                    joinLoading={joiningActivityId === a.id}
                    onJoinPress={() => openJoinModal(a)}
                    canJoin={joinCheck.canJoin}
                    canJoinMessage={joinCheck.message}
                    activityType={a.activity_type}
                    scheduleText={a.schedule_text}
                    partnerWhatsapp={a.partner_whatsapp}
                    interestedCount={a.interested_count || 0}
                    propertyName={a.property_name}
                    onWhatsAppPress={() => handleWhatsAppPress(a)}
                  />
                </View>
              );
            }

            if (item.type === 'hangout') {
              const h = item.data;
              const peopleData = (h.people_images || []).map(p => ({
                image: p.profile_picture || null,
                name: p.name || null,
              }));
              const joinCheck = canJoinHangout(h);

              return (
                <HangoutCard
                  key={`hangout-${h.id}`}
                  profileImage={h.user?.profile_picture}
                  name={h.user?.name || 'User'}
                  nationality={h.user?.nationality}
                  propertyName={h.user?.property_name}
                  title={h.title}
                  typology={h.typology}
                  hangoutPropertyName={h.property_name}
                  linkedActivity={h.linked_activity}
                  description={h.description}
                  peopleCount={h.joined_count || 0}
                  peopleImages={peopleData}
                  isLiked={h.is_liked || false}
                  likesCount={h.likes_count || 0}
                  onPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: h.id,
                    })
                  }
                />
              );
            }

            if (item.type === 'post') {
              const p = item.data;
              return (
                <PromotionCard
                  key={`post-${p.id}`}
                  propertyIcon={p.property_icon}
                  propertyName={p.property_name}
                  title={p.name}
                  marketingTag={p.marketing_tag}
                  description={p.description}
                  image={p.thumbnail}
                  isLiked={postLikeOverrides[p.id] !== undefined ? postLikeOverrides[p.id].is_liked : (p.is_liked || false)}
                  likesCount={postLikeOverrides[p.id] !== undefined ? postLikeOverrides[p.id].likes_count : (p.likes_count || 0)}
                  onLikePress={() => handlePostLike(p.id)}
                  onPress={() => {}}
                />
              );
            }

            return null;
          })}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        type="activities"
      />

      <JoinActivityModal
        visible={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setJoinModalActivity(null);
        }}
        onConfirm={seats => handleActivityJoin(joinModalActivity?.id, seats)}
        price={joinModalActivity?.price}
        isPrivate={joinModalActivity?.is_private}
        loading={joiningActivityId === joinModalActivity?.id}
        maxGuests={joinModalActivity?.max_guests}
        joinedCount={joinModalActivity?.joined_count}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  feedGap: {
    height: 16,
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textGray,
  },
  pendingContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  pendingTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 10,
  },
  pendingText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeScreen;
