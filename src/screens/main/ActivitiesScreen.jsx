import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { ACTIVITY } from '../../api/endpoints';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ActivityCard from '../../components/ActivityCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';
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

const ActivitiesScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchActivities({});
  }, []);

  const fetchActivities = async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams.append(key, String(val));
        }
      });
      const qs = queryParams.toString();
      const url = qs ? `${ACTIVITY.GET_ALL}?${qs}` : ACTIVITY.GET_ALL;

      const response = await api.get(url);
      if (response.data?.activities) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.log('Fetch activities error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

        <View style={styles.cardsContainer}>
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
          ) : (
            activities.map(activity => (
              <ActivityCard
                key={`activity-${activity.id}`}
                image={activity.thumbnail}
                title={activity.title}
                price={activity.price ? `$${activity.price}` : 'Free'}
                description={activity.description}
                time={formatTime(activity.start_time)}
                date={formatDate(activity.start_date)}
                location={activity.location || ''}
                onPress={() =>
                  navigation.navigate(Screens.ActivityDetail, {
                    activityId: activity.id,
                  })
                }
                onMapPress={() => {
                  if (activity.map_url) Linking.openURL(activity.map_url);
                }}
              />
            ))
          )}
        </View>

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
  cardsContainer: {
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
