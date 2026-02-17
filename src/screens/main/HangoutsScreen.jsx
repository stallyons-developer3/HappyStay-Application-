import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { HANGOUT } from '../../api/endpoints';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import HangoutCard from '../../components/HangoutCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import FilterModal from '../../components/FilterModal';
import { useBadgeCounts } from '../../context/BadgeContext';

const HangoutsScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();

  const [hangouts, setHangouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchHangouts({});
  }, []);

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
        setHangouts(response.data.hangouts);
      }
    } catch (error) {
      console.log('Fetch hangouts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const params = { ...activeFilters };
    if (searchText.trim()) params.search = searchText.trim();
    await fetchHangouts(params);
    setRefreshing(false);
  }, [activeFilters, searchText]);

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
          title="Hangouts"
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

              return (
                <HangoutCard
                  key={`hangout-${hangout.id}`}
                  profileImage={hangout.user?.profile_picture}
                  name={hangout.user?.name || 'User'}
                  activityType={hangout.typology || hangout.title}
                  description={hangout.description}
                  peopleCount={hangout.joined_count || 0}
                  peopleImages={peopleData}
                  onPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: hangout.id,
                    })
                  }
                  onJoinPress={() =>
                    navigation.navigate(Screens.HangoutDetail, {
                      hangoutId: hangout.id,
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

export default HangoutsScreen;
