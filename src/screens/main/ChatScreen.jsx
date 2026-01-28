import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';

// Components
import ChatRow from '../../components/ChatRow';

// Static Chat Data
const chatsData = [
  {
    id: 'ai',
    image: require('../../assets/images/ai-avatar.png'),
    title: 'AI Concierge',
    message: 'Dear Thilipan Hope enjoyed the travel...',
    isAI: true,
  },
  {
    id: '1',
    image: require('../../assets/images/bonfire.png'),
    title: 'Bonfire',
    message: 'Hi, Your trip booked on Redbus i...',
    isAI: false,
  },
  {
    id: '2',
    image: require('../../assets/images/profile.png'),
    title: 'Gym',
    message: 'On the way',
    isAI: false,
  },
  {
    id: '3',
    image: require('../../assets/images/beach-party.png'),
    title: 'Beach Party',
    message: 'Have a happy day dear friend',
    isAI: false,
  },
];

const ChatScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  // Handle Chat Press
  // Update handleChatPress function:
  const handleChatPress = chat => {
    navigation.navigate(Screens.ChatDetail);
  };

  return (
    <View style={styles.container}>

      {/* Search Bar */}
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

      {/* Chat List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {chatsData.map(chat => (
          <ChatRow
            key={chat.id}
            image={chat.image}
            title={chat.title}
            message={chat.message}
            isAI={chat.isAI}
            onPress={() => handleChatPress(chat)}
          />
        ))}

        {/* Bottom Spacing */}
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

  // Search Bar
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
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});

export default ChatScreen;
