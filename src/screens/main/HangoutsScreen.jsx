import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL, HANGOUT, PROFILE } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { setUser } from '../../store/slices/authSlice';
import { saveUserData } from '../../utils/storage';

import SearchBar from '../../components/SearchBar';
import HangoutCard from '../../components/HangoutCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';
import { useBadgeCounts } from '../../context/BadgeContext';
import { useToast } from '../../context/ToastContext';

const HangoutsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();
  const { showToast } = useToast();

  const [hangouts, setHangouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [joiningId, setJoiningId] = useState(null);

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
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

  const fetchHangouts = async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });
      const qs = queryParams.toString();
      const url = qs ? `${HANGOUT.GET_ALL}?${qs}` : HANGOUT.GET_ALL;

      const response = await api.get(url);
      if (response.data?.hangouts) {
        const list = response.data.hangouts;
        setHangouts(list);
        list.forEach(h => {
          if (h.user?.profile_picture) Image.prefetch(h.user.profile_picture).catch(() => {});
        });
      }
    } catch (error) {
      console.log('Fetch hangouts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHangouts({});
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const params = { ...activeFilters };
    if (searchText.trim()) params.search = searchText.trim();
    await Promise.all([
      fetchHangouts(params),
      api.get(PROFILE.GET_PROFILE).then(res => {
        if (res.data?.success && res.data?.user) {
          dispatch(setUser(res.data.user));
          saveUserData(res.data.user);
        }
      }).catch(() => {}),
    ]);
    setRefreshing(false);
  }, [dispatch, activeFilters, searchText]);

  const handleSearch = () => {
    const params = { ...activeFilters };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setIsLoading(true);
    fetchHangouts(params);
  };

  const handleFilterApply = filterParams => {
    const params = { ...filterParams };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setActiveFilters(filterParams);
    setIsLoading(true);
    fetchHangouts(params);
  };

  const handleJoinRequest = async hangoutId => {
    setJoiningId(hangoutId);
    try {
      const response = await api.post(HANGOUT.SEND_REQUEST(hangoutId));
      const newStatus = response.data?.request_status || 'pending';
      showToast('success', response.data?.message || 'Request sent!');
      setHangouts(prev =>
        prev.map(h =>
          h.id === hangoutId
            ? {
                ...h,
                user_request_status: newStatus,
                joined_count:
                  newStatus === 'accepted'
                    ? (h.joined_count || 0) + 1
                    : h.joined_count,
              }
            : h,
        ),
      );
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to send join request';
      showToast('info', msg);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLikePress = async hangoutId => {
    setHangouts(prev =>
      prev.map(h => {
        if (h.id !== hangoutId) return h;
        const newLiked = !h.is_liked;
        return {
          ...h,
          is_liked: newLiked,
          likes_count: newLiked
            ? (h.likes_count || 0) + 1
            : Math.max(0, (h.likes_count || 0) - 1),
        };
      }),
    );
    try {
      await api.post(HANGOUT.TOGGLE_LIKE(hangoutId));
    } catch (e) {
      setHangouts(prev =>
        prev.map(h => {
          if (h.id !== hangoutId) return h;
          const revert = !h.is_liked;
          return {
            ...h,
            is_liked: revert,
            likes_count: revert
              ? (h.likes_count || 0) + 1
              : Math.max(0, (h.likes_count || 0) - 1),
          };
        }),
      );
    }
  };

  const handleCreatePress = () => {
    if (!user?.property || !user?.check_in || !user?.check_out) {
      showToast('info', 'You must be assigned to a property to create hangouts.');
      return;
    }
    navigation.navigate('CreateHangout');
  };

  const profileImage = user?.profile_picture
    ? {
        uri: user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/${user.profile_picture}`,
      }
    : undefined;

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
        {/* Custom Header with Create button */}
        <View style={styles.headerContainer}>
          <View style={styles.topRow}>
            <View style={styles.leftSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.profileContainer}
                onPress={() => navigation.navigate(Screens.Profile)}
              >
                <Image
                  source={profileImage || require('../../assets/images/profile.png')}
                  style={styles.profileImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Hangouts</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.notificationContainer}
              onPress={() => navigation.navigate(Screens.Notification)}
            >
              <View style={styles.notificationIconWrapper}>
                <Image
                  source={require('../../assets/images/icons/notification.png')}
                  style={styles.notificationIcon}
                  resizeMode="contain"
                />
              </View>
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hangouts</Text>
            <TouchableOpacity
              style={[styles.createButton, !user?.property && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleCreatePress}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitleText}>
            Share your plans or join a group! From hikes to drinks, create your
            own Hangout or see what fellow guests are organizing.
          </Text>
        </View>

        <SearchBar
          placeholder="Find your hangout"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={handleSearch}
          onActionPress={() => setShowFilterModal(true)}
        />

        <View style={styles.cardsContainer}>
          {isLoading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginTop: 50 }}
            />
          ) : hangouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hangouts found</Text>
            </View>
          ) : (
            hangouts.map(hangout => {
              const peopleData = (hangout.people_images || []).map(p => ({
                image: p.profile_picture || null,
                name: p.name || null,
              }));
              const joinCheck = canJoinHangout(hangout);

              return (
                <HangoutCard
                  key={`hangout-${hangout.id}`}
                  profileImage={hangout.user?.profile_picture}
                  name={hangout.user?.name || 'User'}
                  title={hangout.title}
                  typology={hangout.typology}
                  description={hangout.description}
                  peopleCount={hangout.joined_count || 0}
                  peopleImages={peopleData}
                  isOwner={hangout.user?.id === user?.id}
                  isPublic={!hangout.is_private}
                  requestStatus={hangout.user_request_status}
                  joinLoading={joiningId === hangout.id}
                  canJoin={joinCheck.canJoin}
                  canJoinMessage={joinCheck.message}
                  isLiked={hangout.is_liked || false}
                  likesCount={hangout.likes_count || 0}
                  onLikePress={() => handleLikePress(hangout.id)}
                  onPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: hangout.id,
                    })
                  }
                  onJoinPress={() => handleJoinRequest(hangout.id)}
                  onChatPress={() =>
                    navigation.navigate(Screens.ChatDetail, {
                      hangoutId: hangout.id,
                      title: hangout.title,
                    })
                  }
                />
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        type="hangouts"
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
  headerContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.white,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 32,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 10,
    color: Colors.white,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  greeting: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 28,
    color: Colors.white,
    lineHeight: 38,
  },
  createButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'lowercase',
  },
  subtitleText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  cardsContainer: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 100,
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
});

export default HangoutsScreen;
