import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import { NOTIFICATION, SUPPORT, CHAT } from '../api/endpoints';
import { subscribeToChannel } from '../services/pusherService';

const STORAGE_KEY = 'chat_unreads';

const BadgeContext = createContext({
  notificationCount: 0,
  chatCount: 0,
  chatUnreads: {},
  refreshCounts: () => {},
  resetNotificationCount: () => {},
  updateNotificationCount: () => {},
  resetChatCount: () => {},
  incrementChatUnread: () => {},
  clearChatUnread: () => {},
  getChatUnread: () => 0,
  registerGroupChats: () => {},
});

export const useBadgeCounts = () => useContext(BadgeContext);

export const BadgeProvider = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatUnreads, setChatUnreads] = useState({});
  const subscribedChannelsRef = useRef(new Set());
  // Track which chat is currently open so we don't increment it
  const activeChatRef = useRef(null);
  // Track cleanup functions to prevent duplicate subscriptions
  const notifCleanupRef = useRef(null);
  const supportCleanupRef = useRef(null);

  // Load persisted unreads from AsyncStorage
  useEffect(() => {
    const loadUnreads = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setChatUnreads(JSON.parse(stored));
        }
      } catch (e) {
      }
    };
    loadUnreads();
  }, []);

  // Persist unreads to AsyncStorage whenever they change
  useEffect(() => {
    const saveUnreads = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(chatUnreads));
      } catch (e) {
      }
    };
    saveUnreads();
  }, [chatUnreads]);

  // Total chat count = sum of all per-chat unreads
  const chatCount = Object.values(chatUnreads).reduce((sum, c) => sum + c, 0);

  // Fetch notification count from backend
  const fetchNotifCount = useCallback(async () => {
    try {
      const res = await api
        .get(NOTIFICATION.GET_ALL, { params: { page: 1 } })
        .catch(() => null);
      if (res?.data?.unread_count !== undefined) {
        setNotificationCount(res.data.unread_count);
      }
    } catch (e) {
    }
  }, []);

  // Fetch support unread count from backend and set it
  const fetchSupportUnread = useCallback(async () => {
    try {
      // Don't overwrite if user is currently viewing support chat
      if (activeChatRef.current === 'support') return;
      const res = await api.get(SUPPORT.UNREAD_COUNT).catch(() => null);
      if (res?.data?.unread_count !== undefined) {
        setChatUnreads(prev => ({ ...prev, support: res.data.unread_count }));
      }
    } catch (e) {
    }
  }, []);

  // (fetchAndSubscribeGroupChats is defined after subscribeGroupChannel below)

  // Real-time: notification channel
  useEffect(() => {
    if (!user?.id) return;
    // Always clean up previous subscription first to prevent duplicates
    if (typeof notifCleanupRef.current === 'function') {
      notifCleanupRef.current();
      notifCleanupRef.current = null;
    }
    const ch = `user-notifications.${user.id}`;
    const result = subscribeToChannel(ch, 'new-notification', () => {
      setNotificationCount(prev => prev + 1);
    });
    notifCleanupRef.current = typeof result === 'function' ? result : null;
    return () => {
      if (typeof notifCleanupRef.current === 'function') {
        notifCleanupRef.current();
        notifCleanupRef.current = null;
      }
    };
  }, [user?.id]);

  // Real-time: support chat channel
  useEffect(() => {
    if (!user?.id) return;
    // Always clean up previous subscription first to prevent duplicates
    if (typeof supportCleanupRef.current === 'function') {
      supportCleanupRef.current();
      supportCleanupRef.current = null;
    }
    const ch = `support-chat.${user.id}`;
    const result = subscribeToChannel(ch, 'new-message', data => {
      if (data?.sender_id !== user.id) {
        // Don't increment if user is currently viewing support chat
        if (activeChatRef.current === 'support') return;
        setChatUnreads(prev => ({ ...prev, support: (prev.support || 0) + 1 }));
      }
    });
    supportCleanupRef.current = typeof result === 'function' ? result : null;
    return () => {
      if (typeof supportCleanupRef.current === 'function') {
        supportCleanupRef.current();
        supportCleanupRef.current = null;
      }
    };
  }, [user?.id]);

  // Subscribe to a group chat channel for real-time unread tracking
  const subscribeGroupChannel = useCallback(
    (type, id) => {
      const chatKey = `${type}-${id}`;
      const channelName = `${type}-chat.${id}`;

      if (subscribedChannelsRef.current.has(channelName)) return;
      subscribedChannelsRef.current.add(channelName);

      subscribeToChannel(channelName, 'new-message', data => {
        const msgUserId =
          data?.message?.user?.id || data?.user?.id || data?.message?.user_id;
        // Don't count own messages
        if (String(msgUserId) === String(user?.id)) return;
        // Don't increment if user is currently viewing this chat
        if (activeChatRef.current === chatKey) return;
        setChatUnreads(prev => ({
          ...prev,
          [chatKey]: (prev[chatKey] || 0) + 1,
        }));
      });
    },
    [user?.id],
  );

  // Register multiple group chats at once (called from ChatScreen)
  const registerGroupChats = useCallback(
    groups => {
      groups.forEach(g => {
        subscribeGroupChannel(g.type, g.id);
      });
    },
    [subscribeGroupChannel],
  );

  // Fetch user's group chats, populate per-chat unread counts, and subscribe
  // to each Pusher channel so bubbles update even before the user opens the
  // Chat tab. This also catches messages received while the app was killed.
  const fetchAndSubscribeGroupChats = useCallback(async () => {
    try {
      const res = await api.get(CHAT.MY_GROUPS).catch(() => null);
      const groups = res?.data?.chat_groups || res?.data?.groups || [];

      // Subscribe to each chat's Pusher channel
      groups.forEach(g => {
        if (g?.type && g?.id != null) {
          subscribeGroupChannel(g.type, g.id);
        }
      });

      // Populate per-chat unread counts from server (preserves support count)
      setChatUnreads(prev => {
        const next = { support: prev.support || 0 };
        groups.forEach(g => {
          if (g?.type && g?.id != null) {
            const chatKey = `${g.type}-${g.id}`;
            // Don't overwrite the count for the chat the user is currently viewing
            if (activeChatRef.current === chatKey) return;
            const count = Number(g.unread_count || 0);
            if (count > 0) {
              next[chatKey] = count;
            }
          }
        });
        return next;
      });
    } catch (e) {
    }
  }, [subscribeGroupChannel]);

  // Initial fetch + subscribe (after user logs in)
  useEffect(() => {
    if (user?.id) {
      fetchNotifCount();
      fetchSupportUnread();
      fetchAndSubscribeGroupChats();
    }
  }, [user?.id, fetchNotifCount, fetchSupportUnread, fetchAndSubscribeGroupChats]);

  // Poll every 30s
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetchNotifCount();
      fetchSupportUnread();
      fetchAndSubscribeGroupChats();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifCount, fetchSupportUnread, fetchAndSubscribeGroupChats]);

  // Refresh counts when app returns to foreground (covers killed-app case)
  useEffect(() => {
    if (!user?.id) return;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        fetchNotifCount();
        fetchSupportUnread();
        fetchAndSubscribeGroupChats();
      }
    });
    return () => sub.remove();
  }, [user?.id, fetchNotifCount, fetchSupportUnread, fetchAndSubscribeGroupChats]);

  // Increment a specific chat's unread count
  const incrementChatUnread = useCallback(chatKey => {
    setChatUnreads(prev => ({ ...prev, [chatKey]: (prev[chatKey] || 0) + 1 }));
  }, []);

  // Clear a specific chat's unread count (when user opens that chat)
  const clearChatUnread = useCallback(chatKey => {
    activeChatRef.current = chatKey;
    setChatUnreads(prev => {
      const updated = { ...prev };
      delete updated[chatKey];
      return updated;
    });
  }, []);

  // Called when user leaves a chat screen
  const unsetActiveChat = useCallback(() => {
    activeChatRef.current = null;
  }, []);

  // Get unread count for a specific chat
  const getChatUnread = useCallback(
    chatKey => {
      return chatUnreads[chatKey] || 0;
    },
    [chatUnreads],
  );

  const refreshCounts = useCallback(() => {
    fetchNotifCount();
    fetchSupportUnread();
  }, [fetchNotifCount, fetchSupportUnread]);

  const resetNotificationCount = useCallback(() => {
    setNotificationCount(0);
  }, []);

  const updateNotificationCount = useCallback(count => {
    setNotificationCount(count);
  }, []);

  const resetChatCount = useCallback(() => {
    // No-op; individual chats are cleared via clearChatUnread
  }, []);

  return (
    <BadgeContext.Provider
      value={{
        notificationCount,
        chatCount,
        chatUnreads,
        refreshCounts,
        resetNotificationCount,
        updateNotificationCount,
        resetChatCount,
        incrementChatUnread,
        clearChatUnread,
        unsetActiveChat,
        getChatUnread,
        registerGroupChats,
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export default BadgeContext;
