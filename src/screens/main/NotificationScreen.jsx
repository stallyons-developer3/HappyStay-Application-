import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { NOTIFICATION } from '../../api/endpoints';
import { subscribeToChannel } from '../../services/pusherService';
import { useBadgeCounts } from '../../context/BadgeContext';

// Get icon based on notification type
const getNotificationIcon = type => {
  switch (type) {
    case 'booking':
      return require('../../assets/images/icons/calendar-small.png');
    case 'hangout':
      return require('../../assets/images/icons/hangouts.png');
    case 'activity':
      return require('../../assets/images/icons/activities.png');
    case 'promo':
      return require('../../assets/images/icons/promo-icon.png');
    case 'chat':
      return require('../../assets/images/icons/chat.png');
    default:
      return require('../../assets/images/icons/notification.png');
  }
};

// Get background color based on notification type
const getIconBgColor = (type, isRead) => {
  if (isRead) return '#F5F5F5';
  switch (type) {
    case 'booking':
      return '#E8F5E9';
    case 'hangout':
      return '#E3F2FD';
    case 'activity':
      return '#FFF3E0';
    case 'promo':
      return '#FCE4EC';
    case 'chat':
      return '#E8F5E9';
    default:
      return '#F5F5F5';
  }
};

// Format time ago from date string
const timeAgo = dateStr => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

// Extract model name from related_type
const getModelName = relatedType => {
  if (!relatedType) return null;
  const parts = relatedType.split('\\');
  return parts[parts.length - 1];
};

const NotificationScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const { resetNotificationCount, updateNotificationCount } = useBadgeCounts();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [markingRead, setMarkingRead] = useState(false);

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const fetchNotifications = useCallback(async (page = 1, refresh = false) => {
    try {
      const response = await api.get(NOTIFICATION.GET_ALL, {
        params: { page },
      });

      if (response.data?.success) {
        const fetched = response.data.notifications || [];
        if (refresh || page === 1) {
          setNotifications(fetched);
        } else {
          setNotifications(prev => [...prev, ...fetched]);
        }
        setUnreadCount(response.data.unread_count || 0);
        setCurrentPage(response.data.pagination?.current_page || 1);
        setLastPage(response.data.pagination?.last_page || 1);
      }
    } catch (error) {
      console.log('Fetch notifications error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `user-notifications.${user.id}`;

    const cleanup = subscribeToChannel(
      channelName,
      'new-notification',
      data => {
        if (data?.notification) {
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      },
    );

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications(1, true);
    });
    return unsubscribe;
  }, [navigation, fetchNotifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (loadingMore || currentPage >= lastPage) return;
    setLoadingMore(true);
    fetchNotifications(currentPage + 1);
  }, [loadingMore, currentPage, lastPage, fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingRead) return;
    setMarkingRead(true);
    try {
      const response = await api.post(NOTIFICATION.READ_ALL);
      if (response.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        resetNotificationCount();
      }
    } catch (error) {
      console.log('Mark all read error:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNotificationPress = async notification => {
    if (!notification.is_read) {
      try {
        const response = await api.post(
          NOTIFICATION.READ_SINGLE(notification.id),
        );
        if (response.data?.success) {
          setNotifications(prev =>
            prev.map(n =>
              n.id === notification.id ? { ...n, is_read: true } : n,
            ),
          );
          const newUnreadCount =
            response.data.unread_count ?? Math.max(0, unreadCount - 1);
          setUnreadCount(newUnreadCount);
          updateNotificationCount(newUnreadCount);
        }
      } catch (error) {
        console.log('Mark read error:', error);
      }
    }

    const modelName = getModelName(notification.related_type);
    const relatedId = notification.related_id;

    if (!modelName || !relatedId) return;

    switch (modelName) {
      case 'Hangout':
        navigation.navigate(Screens.HangoutDetail, { hangoutId: relatedId });
        break;
      case 'Activity':
        navigation.navigate(Screens.ActivityDetail, { activityId: relatedId });
        break;
      case 'Property':
        navigation.navigate(Screens.PropertyDetail, { propertyId: relatedId });
        break;
      default:
        break;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconBgColor(item.type, item.is_read) },
        ]}
      >
        <Image
          source={getNotificationIcon(item.type)}
          style={styles.notificationIcon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.notificationTime}>{timeAgo(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={styles.bottomSpacing} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../../assets/images/icons/notification.png')}
          style={styles.emptyIcon}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyDescription}>
          You don't have any notifications yet.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/arrow-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={markingRead}
              activeOpacity={0.7}
            >
              <Text style={styles.markReadText}>
                {markingRead ? 'Marking...' : 'Mark all read'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          renderItem={renderNotification}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textBlack,
  },
  headerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  headerRight: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  markReadText: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  notificationIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },
  notificationDescription: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 11,
    color: Colors.textGray,
    marginTop: 8,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: Colors.textLight,
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default NotificationScreen;
