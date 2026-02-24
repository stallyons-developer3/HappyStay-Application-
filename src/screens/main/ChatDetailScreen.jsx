import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Keyboard,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Shadow } from 'react-native-shadow-2';
import { Colors, Fonts } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { SUPPORT, ACTIVITY, HANGOUT } from '../../api/endpoints';
import { subscribeToChannel } from '../../services/pusherService';
import ChatBubble from '../../components/ChatBubble';
import { useBadgeCounts } from '../../context/BadgeContext';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');
const INPUT_WIDTH = width - 40 - 48 - 12;
const INACTIVITY_TIMEOUT = 60000; // 1 minute

const ChatDetailScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const {
    isSupport,
    activityId,
    hangoutId,
    title: paramTitle,
  } = route.params || {};
  const { user } = useSelector(state => state.auth);

  const isActivityChat = !!activityId;
  const isHangoutChat = !!hangoutId;
  const isGroupChat = isActivityChat || isHangoutChat;
  const groupId = activityId || hangoutId;

  const headerTitle = isSupport
    ? 'Support'
    : paramTitle || (isActivityChat ? 'Activity Chat' : 'Hangout Chat');

  const headerSubtitle = isSupport
    ? 'Online'
    : isActivityChat
    ? 'Activity Chat'
    : 'Hangout Chat';

  const channelName = isSupport
    ? `support-chat.${user?.id}`
    : isActivityChat
    ? `activity-chat.${groupId}`
    : `hangout-chat.${groupId}`;

  const { clearChatUnread, unsetActiveChat } = useBadgeCounts();
  const chatKey = isSupport
    ? 'support'
    : isActivityChat
    ? `activity-${groupId}`
    : `hangout-${groupId}`;

  // Clear unread badge when entering chat, unset when leaving
  useEffect(() => {
    clearChatUnread(chatKey);
    // Mark support messages as read on backend
    if (isSupport) {
      api.post(SUPPORT.MARK_READ).catch(() => {});
    }
    return () => {
      // Mark read again on leave so any real-time messages received while in chat are marked
      if (isSupport) {
        api.post(SUPPORT.MARK_READ).catch(() => {});
      }
      unsetActiveChat();
    };
  }, [chatKey]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [isBotActive, setIsBotActive] = useState(true);
  const scrollViewRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inactivityTimerRef = useRef(null);
  const isBotActiveRef = useRef(true);

  // Keep ref in sync with state (for use inside callbacks/timeouts)
  useEffect(() => {
    isBotActiveRef.current = isBotActive;
  }, [isBotActive]);

  // ========== INACTIVITY TIMER (Support chat only, when bot is OFF) ==========
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    // Only start timer if this is support chat AND bot is OFF (admin is chatting)
    if (isSupport && !isBotActiveRef.current) {
      inactivityTimerRef.current = setTimeout(() => {
        setShowEndChatModal(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [isSupport, clearInactivityTimer]);

  const handleContinueChat = useCallback(() => {
    setShowEndChatModal(false);
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleEndChat = useCallback(async () => {
    setShowEndChatModal(false);
    clearInactivityTimer();
    // Call API to reactivate bot
    try {
      await api.post(SUPPORT.END_CHAT);
      setIsBotActive(true);
      isBotActiveRef.current = true;
    } catch (error) {
      console.log('End chat error:', error);
    }
  }, [clearInactivityTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInactivityTimer();
  }, [clearInactivityTimer]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const cleanup = subscribeToChannel(channelName, 'new-message', data => {
      handlePusherMessage(data);
    });
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [channelName]);

  const fetchMessages = async () => {
    try {
      let response;
      if (isSupport) {
        response = await api.get(SUPPORT.GET_MESSAGES);
        if (response.data?.messages) {
          const msgs = response.data.messages;
          setMessages(msgs);
          const ids = new Set();
          msgs.forEach(m => ids.add(m.id));
          messageIdsRef.current = ids;

          // Track bot status from API response
          const botActive = response.data.is_bot_active !== false;
          setIsBotActive(botActive);
          isBotActiveRef.current = botActive;
          // If bot is OFF (admin is chatting), start inactivity timer
          if (!botActive) {
            resetInactivityTimer();
          }
        }
      } else {
        const endpoint = isActivityChat
          ? ACTIVITY.GET_CHAT(groupId)
          : HANGOUT.GET_CHAT(groupId);
        response = await api.get(endpoint);
        if (response.data?.messages) {
          const raw = response.data.messages;
          const msgs = Array.isArray(raw) ? [...raw].reverse() : [];
          setMessages(msgs);
          const ids = new Set();
          msgs.forEach(m => ids.add(m.id));
          messageIdsRef.current = ids;
        }
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePusherMessage = data => {
    const msg = data.message || data;
    const msgId = msg.id;
    if (!msgId) return;
    if (messageIdsRef.current.has(msgId)) return;

    if (isSupport) {
      if (msg.sender_id === user?.id) return;
      const newMessage = {
        id: msgId,
        message: msg.message,
        is_mine: false,
        is_bot: msg.is_bot || false,
        sender: msg.sender || {
          id: null,
          name: 'Support',
          profile_picture: null,
        },
        created_at: msg.created_at,
        time: msg.time || '',
      };
      messageIdsRef.current.add(msgId);
      setMessages(prev => [...prev, newMessage]);

      // If we receive a non-bot message from support/admin, bot is OFF
      if (!newMessage.is_bot) {
        setIsBotActive(false);
        isBotActiveRef.current = false;
      }
    } else {
      if (String(msg.user?.id) === String(user?.id)) return;
      messageIdsRef.current.add(msgId);
      setMessages(prev => [...prev, msg]);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    // Reset inactivity timer on new message received
    resetInactivityTimer();
  };

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getUserName = () => {
    if (user?.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user?.name || 'You';
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const text = message.trim();
    const tempId = `temp-${Date.now()}`;
    setMessage('');
    setIsSending(true);

    if (isSupport) {
      const optimisticMsg = {
        id: tempId,
        message: text,
        is_mine: true,
        is_bot: false,
        sender: { id: user?.id, name: 'You', profile_picture: null },
        created_at: new Date().toISOString(),
        time: getCurrentTime(),
      };
      setMessages(prev => [...prev, optimisticMsg]);
    } else {
      const optimisticMsg = {
        id: tempId,
        message: text,
        user: {
          id: user?.id,
          name: getUserName(),
          profile_picture: user?.profile_picture || null,
        },
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let response;
      if (isSupport) {
        response = await api.post(SUPPORT.SEND_MESSAGE, { message: text });
        if (response.data?.chat_message) {
          const sentMsg = response.data.chat_message;
          messageIdsRef.current.add(sentMsg.id);
          // Replace temp message in-place to preserve position
          setMessages(prev =>
            prev.map(m =>
              m.id === tempId ? { ...sentMsg, is_mine: true } : m,
            ),
          );
        }
        if (response.data?.bot_reply) {
          const botMsg = response.data.bot_reply;
          if (!messageIdsRef.current.has(botMsg.id)) {
            messageIdsRef.current.add(botMsg.id);
            setMessages(prev => [...prev, botMsg]);
          }
        }
        // Track bot status from response (may change after escalation)
        if (response.data?.is_bot_active !== undefined) {
          const newBotActive = response.data.is_bot_active;
          setIsBotActive(newBotActive);
          isBotActiveRef.current = newBotActive;
        }
      } else {
        const endpoint = isActivityChat
          ? ACTIVITY.SEND_CHAT(groupId)
          : HANGOUT.SEND_CHAT(groupId);
        response = await api.post(endpoint, { message: text });
        if (response.data?.chat_message) {
          const sentMsg = response.data.chat_message;
          messageIdsRef.current.add(sentMsg.id);
          setMessages(prev => {
            const withoutTemp = prev.filter(m => m.id !== tempId);
            return [...withoutTemp, sentMsg];
          });
        }
      }
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
      // Reset inactivity timer after sending message
      resetInactivityTimer();
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessage(text);
      if (error.response?.status === 403) {
        showToast('error', 'You need to be accepted to send messages.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = dateStr => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getInitial = name => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const renderGroupMessage = (msg, showName) => {
    const isMine = String(msg.user?.id) === String(user?.id);

    return (
      <View
        key={`msg-${msg.id}`}
        style={[
          styles.msgRow,
          isMine && styles.msgRowRight,
          !showName && styles.msgRowContinued,
        ]}
      >
        {!isMine && (
          <View style={styles.avatarContainer}>
            {showName ? (
              msg.user?.profile_picture ? (
                <Image
                  source={{ uri: msg.user.profile_picture }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {getInitial(msg.user?.name)}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          {!isMine && showName && (
            <Text style={styles.senderName}>{msg.user?.name || 'User'}</Text>
          )}
          <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
            {msg.message}
          </Text>
          <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>
            {formatTime(msg.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  const renderGroupMessages = () => {
    return messages.map((msg, index) => {
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const isSameUser =
        prevMsg && String(prevMsg.user?.id) === String(msg.user?.id);
      return renderGroupMessage(msg, !isSameUser);
    });
  };

  if (accessDenied) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/icons/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {headerTitle}
            </Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
        </View>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>
            You need to be accepted to access this chat.
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/icons/arrow-left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {isSupport && (
          <Image
            source={require('../../assets/images/ai-avatar.png')}
            style={styles.profileImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isSupport
              ? isBotActive
                ? 'Bot'
                : 'Live Support'
              : headerSubtitle}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isSupport
                    ? 'Start a conversation with support'
                    : 'No messages yet. Start the conversation!'}
                </Text>
              </View>
            )}

            {isSupport
              ? messages.map(msg => (
                  <ChatBubble
                    key={`msg-${msg.id}`}
                    message={msg.message}
                    time={formatTime(msg.created_at)}
                    isSent={msg.is_mine}
                  />
                ))
              : renderGroupMessages()}

            {isSupport && isSending && (
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Support is typing...</Text>
              </View>
            )}
          </ScrollView>
        )}

        <View
          style={[
            styles.inputContainer,
            Platform.OS === 'android' &&
              keyboardHeight > 0 && { paddingBottom: keyboardHeight + 16 },
          ]}
        >
          <Shadow
            distance={8}
            startColor="rgba(0, 0, 0, 0.06)"
            endColor="rgba(0, 0, 0, 0)"
            offset={[0, 0]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Message"
                placeholderTextColor={Colors.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                editable={!isSending}
              />
            </View>
          </Shadow>

          <TouchableOpacity
            style={[styles.sendButton, isSending && { opacity: 0.5 }]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Image
                source={require('../../assets/images/icons/send.png')}
                style={styles.sendIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* End Chat Inactivity Modal (Support only) */}
      <Modal
        visible={showEndChatModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleContinueChat}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalEmoji}>💬</Text>
            <Text style={styles.modalTitle}>Chat Inactive</Text>
            <Text style={styles.modalDescription}>
              Are you still there? No new messages for a while. We're still here
              to help! Tap Continue if you need more assistance.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalContinueButton}
                onPress={handleContinueChat}
                activeOpacity={0.8}
              >
                <Text style={styles.modalContinueText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalEndButton}
                onPress={handleEndChat}
                activeOpacity={0.8}
              >
                <Text style={styles.modalEndText}>End Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
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
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 4,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
  },
  headerSubtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    width: INPUT_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 37,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
  },
  textInput: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    padding: 0,
    maxHeight: 80,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goBackText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.white,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  msgRowRight: {
    justifyContent: 'flex-end',
  },
  msgRowContinued: {
    marginBottom: 3,
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSpacer: {
    width: 32,
    height: 1,
  },
  avatarInitial: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.white,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.backgroundGray,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 11,
    color: Colors.primary,
    marginBottom: 2,
  },
  msgText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
  },
  msgTextMine: {
    color: Colors.white,
  },
  msgTime: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 10,
    color: Colors.textGray,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  // End Chat Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalContinueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalContinueText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: '#374151',
  },
  modalEndButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalEndText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.white,
  },
});

export default ChatDetailScreen;
