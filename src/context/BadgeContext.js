import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axiosInstance';
import { NOTIFICATION, SUPPORT } from '../api/endpoints';
import {
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../services/pusherService';

const BadgeContext = createContext({
  notificationCount: 0,
  chatCount: 0,
  refreshCounts: () => {},
});

export const useBadgeCounts = () => useContext(BadgeContext);

export const BadgeProvider = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [notifRes, chatRes] = await Promise.all([
        api
          .get(NOTIFICATION.GET_ALL, { params: { page: 1 } })
          .catch(() => null),
        api.get(SUPPORT.UNREAD_COUNT).catch(() => null),
      ]);

      if (notifRes?.data?.unread_count !== undefined) {
        setNotificationCount(notifRes.data.unread_count);
      }
      if (chatRes?.data?.unread_count !== undefined) {
        setChatCount(chatRes.data.unread_count);
      }
    } catch (error) {
      console.log('Badge count fetch error:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchCounts();
    }
  }, [user?.id, fetchCounts]);

  // Poll every 30s
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchCounts]);

  // Real-time: notification Pusher channel
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `user-notifications.${user.id}`;
    subscribeToChannel(channelName, 'new-notification', () => {
      setNotificationCount(prev => prev + 1);
    });

    return () => unsubscribeFromChannel(channelName);
  }, [user?.id]);

  // Real-time: support chat Pusher channel
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `support-chat.${user.id}`;
    subscribeToChannel(channelName, 'new-message', data => {
      // Only increment if the message is not from the current user (bot or admin reply)
      if (data?.sender_id !== user.id) {
        setChatCount(prev => prev + 1);
      }
    });

    return () => unsubscribeFromChannel(channelName);
  }, [user?.id]);

  const refreshCounts = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Allow resetting notification count (e.g. after mark all read)
  const resetNotificationCount = useCallback(() => {
    setNotificationCount(0);
  }, []);

  // Allow resetting chat count (e.g. when entering chat)
  const resetChatCount = useCallback(() => {
    setChatCount(0);
  }, []);

  return (
    <BadgeContext.Provider
      value={{
        notificationCount,
        chatCount,
        refreshCounts,
        resetNotificationCount,
        resetChatCount,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export default BadgeContext;
