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
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { ACTIVITY } from '../../api/endpoints';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';
import ActivityCarousel from '../../components/ActivityCarousel';
import { useBadgeCounts } from '../../context/BadgeContext';
import { useToast } from '../../context/ToastContext';

const typologyLabels = {
  nature_active: 'Nature & Active',
  sightseeing: 'Sightseeing',
  party: 'Party',
  event: 'Event',
  food_drink: 'Food & Drink',
  transport: 'Transport',
};

const ActivitiesScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();
  const { showToast } = useToast();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const fetchActivities = async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });
      // Fetch all activities (no pagination limit for carousels)
      queryParams.append('per_page', '100');
      const qs = queryParams.toString();
      const url = qs ? `${ACTIVITY.GET_ALL}?${qs}` : ACTIVITY.GET_ALL;

      const response = await api.get(url);
      if (response.data?.activities) {
        const list = response.data.activities;
        setActivities(list);
        list.forEach(a => {
          if (a.thumbnail) Image.prefetch(a.thumbnail).catch(() => {});
        });
      }
    } catch (error) {
      console.log('Fetch activities error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities({});
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const params = { ...activeFilters };
    if (searchText.trim()) params.search = searchText.trim();
    await fetchActivities(params);
    setRefreshing(false);
  }, [activeFilters, searchText]);

  const handleSearch = () => {
    const params = { ...activeFilters };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setIsLoading(true);
    fetchActivities(params);
  };

  const handleFilterApply = filterParams => {
    const params = { ...filterParams };
    if (searchText.trim()) {
      params.search = searchText.trim();
    }
    setActiveFilters(filterParams);
    setIsLoading(true);
    fetchActivities(params);
  };

  const handleActivityPress = activity => {
    navigation.navigate(Screens.ActivityDetail, { activityId: activity.id });
  };

  const handleLikePress = async (activityId) => {
    // Optimistic update — toggle like on ALL instances of this activity
    setActivities(prev =>
      prev.map(a => {
        if (a.id !== activityId) return a;
        const newLiked = !a.is_liked;
        return {
          ...a,
          is_liked: newLiked,
          likes_count: newLiked
            ? (a.likes_count || 0) + 1
            : Math.max(0, (a.likes_count || 0) - 1),
        };
      }),
    );
    try {
      await api.post(ACTIVITY.TOGGLE_LIKE(activityId));
    } catch (e) {
      // Revert on error
      setActivities(prev =>
        prev.map(a => {
          if (a.id !== activityId) return a;
          const revertLiked = !a.is_liked;
          return {
            ...a,
            is_liked: revertLiked,
            likes_count: revertLiked
              ? (a.likes_count || 0) + 1
              : Math.max(0, (a.likes_count || 0) - 1),
          };
        }),
      );
    }
  };

  // Build carousels from activities
  const buildCarousels = () => {
    const carousels = [];

    // 1. "During Your Stay" — event-type activities within user's trip dates (±3 days)
    const addDays = (dateStr, days) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    if (user?.check_in && user?.check_out) {
      const checkIn = addDays(user.check_in.slice(0, 10), -3);
      const checkOut = addDays(user.check_out.slice(0, 10), 3);
      const duringStay = activities.filter(a => {
        if (a.activity_type !== 'event' || !a.start_date) return false;
        const actStart = a.start_date.slice(0, 10);
        const actEnd = (a.end_date || a.start_date).slice(0, 10);
        return actEnd >= checkIn && actStart <= checkOut;
      });
      if (duringStay.length > 0) {
        carousels.push({
          key: 'during_stay',
          title: 'During Your Stay',
          subtitle: 'Activities available while you\'re here',
          activities: duringStay,
        });
      }
    }

    // 2. Carousels by typology
    const typologyGroups = {};
    activities.forEach(a => {
      const typ = a.typology;
      if (!typ) return;
      if (!typologyGroups[typ]) typologyGroups[typ] = [];
      typologyGroups[typ].push(a);
    });

    Object.entries(typologyGroups).forEach(([typ, items]) => {
      carousels.push({
        key: `typology_${typ}`,
        title: typologyLabels[typ] || typ,
        activities: items,
      });
    });

    // 3. "Free Activities" — price = 0 or null
    const freeActivities = activities.filter(
      a => !a.price || parseFloat(a.price) === 0,
    );
    if (freeActivities.length > 0) {
      carousels.push({
        key: 'free',
        title: 'Free Activities',
        subtitle: 'No cost, just fun',
        activities: freeActivities,
      });
    }

    // 4. "Favourites" — most liked (at least 1 like)
    const liked = [...activities]
      .filter(a => (a.likes_count || 0) > 0)
      .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    if (liked.length > 0) {
      carousels.push({
        key: 'favourites',
        title: 'Favourites',
        subtitle: 'Most loved by guests',
        activities: liked,
      });
    }

    return carousels;
  };

  const profileImage = user?.profile_picture
    ? {
        uri: user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/${user.profile_picture}`,
      }
    : undefined;

  const carousels = buildCarousels();
  const hasSearchOrFilter =
    searchText.trim() !== '' || Object.keys(activeFilters).length > 0;

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
          title="Activities"
          greeting="Enjoy Your Day"
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

        {isLoading && !refreshing ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 50 }}
          />
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities found</Text>
          </View>
        ) : hasSearchOrFilter ? (
          // When searching/filtering, show all results in a single carousel
          <View style={styles.carouselSection}>
            <ActivityCarousel
              title="Search Results"
              subtitle={`${activities.length} activities found`}
              activities={activities}
              onActivityPress={handleActivityPress}
              onLikePress={handleLikePress}
            />
          </View>
        ) : (
          // Default view: multiple carousels
          <View style={styles.carouselSection}>
            {carousels.map(carousel => (
              <ActivityCarousel
                key={carousel.key}
                title={carousel.title}
                subtitle={carousel.subtitle}
                activities={carousel.activities}
                onActivityPress={handleActivityPress}
                onLikePress={handleLikePress}
              />
            ))}
          </View>
        )}

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
  carouselSection: {
    marginTop: 16,
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

export default ActivitiesScreen;
