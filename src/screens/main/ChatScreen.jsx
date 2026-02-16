import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { SUPPORT, CHAT } from '../../api/endpoints';

import ChatRow from '../../components/ChatRow';

const ChatScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [groupChats, setGroupChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchGroupChats();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnreadCount();
      fetchGroupChats();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchGroupChats = async () => {
    try {
      const response = await api.get(CHAT.MY_GROUPS);
      if (response.data?.chat_groups) {
        setGroupChats(response.data.chat_groups);
      } else if (response.data?.groups) {
        setGroupChats(response.data.groups);
      }
    } catch (error) {
      console.log('Fetch groups error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(SUPPORT.UNREAD_COUNT);
      if (response.data?.unread_count !== undefined) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.log('Unread count error:', error);
    }
  };

  const handleSupportPress = () => {
    navigation.navigate(Screens.ChatDetail, {
      isSupport: true,
    });
  };

  const handleChatPress = chat => {
    const isActivity = chat.type === 'activity';
    navigation.navigate(Screens.ChatDetail, {
      activityId: isActivity ? chat.id : undefined,
      hangoutId: !isActivity ? chat.id : undefined,
      title: chat.title || chat.name || 'Chat',
    });
  };

  const filteredChats = groupChats.filter(chat => {
    if (!searchText.trim()) return true;
    const name = (chat.title || chat.name || '').toLowerCase();
    return name.includes(searchText.trim().toLowerCase());
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Image
            source={require('../../assets/images/icons/search.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="search"
            placeholderTextColor={Colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ChatRow
          image={require('../../assets/images/ai-avatar.png')}
          title="Support"
          message={
            unreadCount > 0
              ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
              : 'Tap to chat with support'
          }
          isAI={true}
          onPress={handleSupportPress}
        />

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: 30 }}
          />
        ) : (
          filteredChats.map(chat => {
            const chatImage = chat.thumbnail
              ? { uri: chat.thumbnail }
              : require('../../assets/images/profile.png');

            const lastMsg = chat.last_message
              ? `${chat.last_message.user_name || ''}: ${
                  chat.last_message.message || ''
                }`
              : 'No messages yet';

            return (
              <ChatRow
                key={`chat-${chat.type}-${chat.id}`}
                image={chatImage}
                title={chat.title || chat.name || 'Chat'}
                message={lastMsg}
                isAI={false}
                onPress={() => handleChatPress(chat)}
              />
            );
          })
        )}

        {!isLoading && filteredChats.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
});

export default ChatScreen;
