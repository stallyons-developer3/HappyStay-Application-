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
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import api from '../../api/axiosInstance';
import { HANGOUT } from '../../api/endpoints';

import HangoutCard from '../../components/HangoutCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import { useBadgeCounts } from '../../context/BadgeContext';

const ManageScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { notificationCount } = useBadgeCounts();

  const [myHangouts, setMyHangouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyHangouts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyHangouts();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMyHangouts = async () => {
    try {
      const response = await api.get(HANGOUT.GET_ALL);
      if (response.data?.hangouts) {
        const filtered = response.data.hangouts.filter(
          h => h.user?.id === user?.id,
        );
        setMyHangouts(filtered);
      }
    } catch (error) {
      console.log('Fetch my hangouts error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyHangouts();
    setRefreshing(false);
  }, []);

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
              Alert.alert('Success', 'Hangout deleted successfully!');
            } catch (error) {
              Alert.alert(
                'Error',
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
          : `${STORAGE_URL}/storage/profile_pictures/${user.profile_picture}`,
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
          />
        }
      >
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
              <Text style={styles.headerTitle}>Manage Hangouts</Text>
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

          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Create Your{'\n'}Hangout</Text>
            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('CreateHangout')}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          {myHangouts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You haven't created any hangouts yet
              </Text>
            </View>
          )}

          {myHangouts.map(hangout => {
            const peopleData = (hangout.people_images || []).map(p => ({
              image: p.profile_picture || null,
              name: p.name || null,
            }));

            return (
              <HangoutCard
                key={`manage-${hangout.id}`}
                profileImage={hangout.user?.profile_picture}
                name={hangout.user?.name || 'You'}
                activityType={hangout.typology || hangout.title}
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
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />
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
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 10,
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
  cardsContainer: {
    marginTop: 20,
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

export default ManageScreen;
