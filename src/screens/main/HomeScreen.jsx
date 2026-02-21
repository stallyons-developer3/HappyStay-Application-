import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ActivityCard from '../../components/ActivityCard';
import HangoutCard from '../../components/HangoutCard';
import PromotionCard from '../../components/PromotionCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';

import { fetchHomeData } from '../../store/slices/homeSlice';
import { useBadgeCounts } from '../../context/BadgeContext';

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

  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [filtering, setFiltering] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchHomeData());
    }, [dispatch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const params = { ...activeFilters };
    if (searchText.trim()) params.search = searchText.trim();
    await dispatch(fetchHomeData(params));
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
              return (
                <View key={`activity-${a.id}`}>
                  <ActivityCard
                    image={a.thumbnail}
                    title={a.title}
                    price={a.price ? `$${a.price}` : 'Free'}
                    description={a.description}
                    time={a.all_day ? 'All Day' : formatTime(a.start_time)}
                    date={formatDate(a.start_date)}
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

              return (
                <HangoutCard
                  key={`hangout-${h.id}`}
                  profileImage={h.user?.profile_picture}
                  name={h.user?.name || 'User'}
                  activityType={h.interests || h.typology || h.title}
                  description={h.description}
                  peopleCount={h.joined_count || 0}
                  peopleImages={peopleData}
                  isOwner={h.user?.id === user?.id}
                  isPublic={!h.is_private}
                  onPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: h.id,
                    })
                  }
                  onJoinPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: h.id,
                    })
                  }
                  onChatPress={() =>
                    navigation.navigate(Screens.ChatDetail, {
                      hangoutId: h.id,
                      title: h.title,
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
                  icon={p.thumbnail}
                  title={p.name}
                  description={p.description}
                  link={p.marketing_tag}
                  onPress={() => console.log('Post pressed', p.id)}
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
});

export default HomeScreen;
