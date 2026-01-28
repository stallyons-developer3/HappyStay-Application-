import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Fonts } from '../../constants/Constants';

// Components
import ChatBubble from '../../components/ChatBubble';

// Static Chat Data
const chatMessages = [
  {
    id: '1',
    message:
      'scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
    time: '12.10 pm',
    isSent: true,
  },
  {
    id: '2',
    message: 'It was popularised in the 1960s',
    time: '12.10 pm',
    isSent: true,
  },
  {
    id: '3',
    message: "Industry's standard dummy text ever since the 1500s",
    time: '12.10 pm',
    isSent: true,
  },
  {
    id: '4',
    message: 'Behance>',
    time: '04.10 pm',
    isSent: true,
    isLink: true,
    linkText: 'https://www.behance.net/annathilipan',
    linkUrl: 'https://www.behance.net/annathilipan',
  },
  {
    id: '5',
    message: 'Achieve todays goal',
    time: '04.10 pm',
    isSent: true,
  },
  {
    id: '6',
    message: "Bus ticket booked on Thursday,don't forget",
    time: '06.00 pm',
    isSent: true,
  },
  {
    id: '7',
    message: 'Mark calendar',
    time: '11.12 pm',
    isSent: true,
  },
];

const ChatDetailScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef(null);

  // Handle Send
  const handleSend = () => {
    if (message.trim()) {
      console.log('Send message:', message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
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

        {/* Profile Image */}
        <Image
          source={require('../../assets/images/beach-party.png')}
          style={styles.profileImage}
          resizeMode="cover"
        />

        {/* Title */}
        <Text style={styles.headerTitle}>Beach Party</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {chatMessages.map(chat => (
          <ChatBubble
            key={chat.id}
            message={chat.message}
            time={chat.time}
            isSent={chat.isSent}
            isLink={chat.isLink}
            linkText={chat.linkText}
            linkUrl={chat.linkUrl}
          />
        ))}
      </ScrollView>

      {/* Message Input - Fixed at Bottom (Same as ActivityDetailScreen) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Message"
              placeholderTextColor={Colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/icons/send.png')}
              style={styles.sendIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
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
  headerTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginLeft: 12,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },

  // Input Container (Same style as ActivityDetailScreen)
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 37,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginRight: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textDark,
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
});

export default ChatDetailScreen;
