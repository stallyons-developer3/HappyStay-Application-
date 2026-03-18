import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL, HANGOUT, ACTIVITY } from '../../api/endpoints';
const formatHangoutDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
};
import api from '../../api/axiosInstance';

import HangoutCard from '../../components/HangoutCard';
import { useBadgeCounts } from '../../context/BadgeContext';
import { useToast } from '../../context/ToastContext';

const formatDate = dateStr => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`;
};

const ManageScreen = ({ navigation }) => {
  const { showToast } = useToast();
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();

  const [myHangouts, setMyHangouts] = useState([]);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const [joinedHangouts, setJoinedHangouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [hangoutsRes, activitiesRes, participatingHangoutsRes] = await Promise.allSettled([
        api.get(HANGOUT.GET_ALL),
        api.get(ACTIVITY.PARTICIPATING),
        api.get(HANGOUT.PARTICIPATING),
      ]);

      if (hangoutsRes.status === 'fulfilled' && hangoutsRes.value?.data?.hangouts) {
        setMyHangouts(
          hangoutsRes.value.data.hangouts.filter(h => h.user?.id === user?.id),
        );
      }

      if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.data?.activities) {
        setJoinedActivities(activitiesRes.value.data.activities);
      }

      if (participatingHangoutsRes.status === 'fulfilled' && participatingHangoutsRes.value?.data?.hangouts) {
        setJoinedHangouts(
          participatingHangoutsRes.value.data.hangouts.filter(h => h.user?.id !== user?.id),
        );
      }
    } catch (error) {
      console.log('Fetch manage data error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleDelete = hangoutId => {
    Alert.alert(
      'Delete Hangout',
      'Are you sure you want to delete this hangout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(HANGOUT.DELETE(hangoutId));
              setMyHangouts(prev => prev.filter(h => h.id !== hangoutId));
              showToast('success', 'Hangout deleted successfully!');
            } catch (error) {
              showToast(
                'error',
                error.response?.data?.message || 'Failed to delete hangout',
              );
            }
          },
        },
      ],
    );
  };

  const profileImage = user?.profile_picture
    ? {
        uri: user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/${user.profile_picture}`,
      }
    : require('../../assets/images/profile.png');

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
            progressViewOffset={30}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.leftSection}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.profileContainer}
                onPress={() => navigation.navigate(Screens.Profile)}
              >
                <Image
                  source={profileImage}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage</Text>
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
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>Manage</Text>
        </View>

        {/* Section 1: Profile */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Manage Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Screens.Profile)}
        >
          <Image
            source={profileImage}
            style={styles.profileCardImage}
            resizeMode="cover"
          />
          <View style={styles.profileCardInfo}>
            <Text style={styles.profileCardName}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.profileCardSub}>View and edit your profile</Text>
          </View>
          <Image
            source={require('../../assets/images/arrow-left.png')}
            style={styles.chevron}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Section 2: My Hangouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Hangouts</Text>
        </View>

        {myHangouts.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>You haven't created any hangouts yet</Text>
          </View>
        ) : (
          myHangouts.map(hangout => {
            const peopleData = (hangout.people_images || []).map(p => ({
              image: p.profile_picture || null,
              name: p.name || null,
            }));

            return (
              <HangoutCard
                key={`manage-${hangout.id}`}
                profileImage={hangout.user?.profile_picture}
                name={hangout.user?.name || 'You'}
                title={hangout.title}
                typology={hangout.typology}
                description={hangout.description}
                peopleCount={hangout.joined_count || 0}
                peopleImages={peopleData}
                showMenu={true}
                isOwner={true}
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
                onEditPress={() =>
                  navigation.navigate(Screens.CreateHangout, {
                    isEdit: true,
                    hangoutId: hangout.id,
                  })
                }
                onDeletePress={() => handleDelete(hangout.id)}
              />
            );
          })
        )}

        {/* Section 3: Joined Activities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Joined Activities</Text>
        </View>

        {joinedActivities.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>You haven't joined any activities yet</Text>
          </View>
        ) : (
          joinedActivities.map(activity => (
            <TouchableOpacity
              key={`joined-activity-${activity.id}`}
              style={styles.activityItem}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(Screens.ActivityDetail, {
                  activityId: activity.id,
                })
              }
            >
              <Image
                source={
                  activity.thumbnail
                    ? { uri: activity.thumbnail }
                    : require('../../assets/images/bonfire.png')
                }
                style={styles.activityThumb}
                resizeMode="cover"
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                <Text style={styles.activityDate}>
                  {activity.start_date ? formatDate(activity.start_date) : 'Open'}
                  {activity.end_date && activity.end_date !== activity.start_date
                    ? ` - ${formatDate(activity.end_date)}`
                    : ''}
                </Text>
                <Text style={styles.activityStatus}>
                  {activity.user_request_status === 'accepted' ? 'Joined' : activity.user_request_status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Section 4: Joined Hangouts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Joined Hangouts</Text>
        </View>

        {joinedHangouts.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>You haven't joined any hangouts yet</Text>
          </View>
        ) : (
          joinedHangouts.map(hangout => (
            <TouchableOpacity
              key={`joined-hangout-${hangout.id}`}
              style={styles.activityItem}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(Screens.HangoutDetail, {
                  hangoutId: hangout.id,
                })
              }
            >
              {hangout.user?.profile_picture ? (
                <Image
                  source={{ uri: hangout.user.profile_picture }}
                  style={styles.activityThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.activityThumb, styles.hangoutInitialThumb]}>
                  <Text style={styles.hangoutInitialText}>
                    {hangout.user?.name ? hangout.user.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>{hangout.title}</Text>
                <Text style={styles.activityDate}>
                  {hangout.date ? formatHangoutDate(hangout.date) : 'No date'}
                  {hangout.time ? ` at ${hangout.time}` : ''}
                </Text>
                <Text style={styles.activityStatus}>Joined</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

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
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 28,
    color: Colors.white,
    marginTop: 60,
    marginBottom: 40,
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
  profileImage: {
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
  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  profileCardInfo: {
    flex: 1,
  },
  profileCardName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
  },
  profileCardSub: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: Colors.textGray,
    transform: [{ rotate: '180deg' }],
  },
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
  },
  sectionCount: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  // Joined activity items
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  activityThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  hangoutInitialThumb: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hangoutInitialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.white,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 2,
  },
  activityDate: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  activityStatus: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ManageScreen;
