import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { ACTIVITY, HANGOUT } from '../../api/endpoints';
import Header from '../../components/Header';
import HangoutCard from '../../components/HangoutCard';
import ActivityCard from '../../components/ActivityCard';
import { useFocusEffect } from '@react-navigation/native';
import { useBadgeCounts } from '../../context/BadgeContext';

const formatDate = dateStr => {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

const JoinedScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();
  const [participatingActivities, setParticipatingActivities] = useState([]);
  const [participatingHangouts, setParticipatingHangouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const profileImage = user?.profile_picture
    ? {
        uri: user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/${user.profile_picture}`,
      }
    : undefined;

  const fetchData = useCallback(async () => {
    try {
      const [activitiesRes, hangoutsRes] = await Promise.all([
        api.get(ACTIVITY.PARTICIPATING),
        api.get(HANGOUT.PARTICIPATING),
      ]);
      if (activitiesRes.data?.activities) {
        setParticipatingActivities(activitiesRes.data.activities);
      }
      if (hangoutsRes.data?.hangouts) {
        setParticipatingHangouts(hangoutsRes.data.hangouts);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const buildJoinedFeed = () => {
    const feed = [];
    const activities = [...participatingActivities];
    const hangouts = [...participatingHangouts];
    let ai = 0;
    let hi = 0;
    while (ai < activities.length || hi < hangouts.length) {
      if (ai < activities.length) {
        feed.push({ type: 'activity', data: activities[ai] });
        ai++;
      }
      if (hi < hangouts.length) {
        feed.push({ type: 'hangout', data: hangouts[hi] });
        hi++;
      }
    }
    return feed;
  };

  const joinedFeed = buildJoinedFeed();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
          title="Joined"
          showGreeting={true}
          showBackIcon={true}
          showProfile={true}
          onBackPress={() => navigation.goBack()}
          greeting="Hangouts & Activities"
          notificationCount={notificationCount}
          profileImage={profileImage}
          onProfilePress={() => navigation.navigate(Screens.Profile)}
          onNotificationPress={() => navigation.navigate(Screens.Notification)}
        />

        <View style={styles.cardsContainer}>
          {joinedFeed.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You haven't joined any activities or hangouts yet
              </Text>
            </View>
          ) : (
            joinedFeed.map((item, index) => {
              if (item.type === 'activity') {
                const activity = item.data;
                return (
                  <ActivityCard
                    key={`joined-activity-${activity.id}`}
                    image={activity.thumbnail}
                    title={activity.title}
                    price={activity.price ? `€${activity.price}` : 'Free'}
                    description={activity.description}
                    time={
                      activity.all_day
                        ? 'All Day'
                        : formatTime(activity.start_time) +
                          (activity.end_time ? ' - ' + formatTime(activity.end_time) : '')
                    }
                    date={
                      formatDate(activity.start_date) +
                      (activity.end_date && activity.end_date !== activity.start_date
                        ? ' - ' + formatDate(activity.end_date)
                        : '')
                    }
                    location={activity.location || ''}
                    onPress={() =>
                      navigation.navigate(Screens.ActivityDetail, {
                        activityId: activity.id,
                      })
                    }
                    onMapPress={() => {
                      if (activity.latitude && activity.longitude) {
                        navigation.navigate(Screens.LocationMap, {
                          latitude: activity.latitude,
                          longitude: activity.longitude,
                          title: activity.title,
                          location: activity.location,
                          markerColor: activity.typology_color,
                        });
                      }
                    }}
                    isOwner={false}
                    requestStatus={activity.user_request_status}
                  />
                );
              } else {
                const hangout = item.data;
                const peopleData = (hangout.people_images || []).map(p => ({
                  image: p.profile_picture || null,
                  name: p.name || null,
                }));
                return (
                  <HangoutCard
                    key={`joined-hangout-${hangout.id}`}
                    profileImage={hangout.user?.profile_picture}
                    name={hangout.user?.name || 'Unknown'}
                    activityType={
                      hangout.interests || hangout.typology || hangout.title
                    }
                    description={hangout.description}
                    peopleCount={hangout.joined_count || 0}
                    peopleImages={peopleData}
                    isPublic={!hangout.is_private}
                    onPress={() =>
                      navigation.navigate(Screens.HangoutDetail, {
                        hangoutId: hangout.id,
                      })
                    }
                    onChatPress={() =>
                      navigation.navigate(Screens.ChatDetail, {
                        hangoutId: hangout.id,
                        title: hangout.title,
                      })
                    }
                    onJoinPress={() =>
                      navigation.navigate(Screens.HangoutDetail, {
                        hangoutId: hangout.id,
                      })
                    }
                  />
                );
              }
            })
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
  },
  cardsContainer: {
    marginTop: 16,
  },
  bottomSpacing: {
    height: 40,
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

export default JoinedScreen;
