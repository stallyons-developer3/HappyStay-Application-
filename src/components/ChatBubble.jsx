import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const ChatBubble = ({
  message,
  time,
  isSent = true,
  isLink = false,
  linkText = '',
  linkUrl = '',
}) => {
  // Handle Link Press
  const handleLinkPress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSent ? styles.sentBubble : styles.receivedBubble,
        ]}
      >
        {/* Message Text */}
        <Text
          style={[
            styles.message,
            isSent ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          {message}
        </Text>

        {/* Link (if any) */}
        {isLink && linkUrl ? (
          <TouchableOpacity onPress={handleLinkPress} activeOpacity={0.7}>
            <Text
              style={[
                styles.linkText,
                isSent ? styles.sentLink : styles.receivedLink,
              ]}
            >
              {linkText || linkUrl}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Time */}
        <Text
          style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sentContainer: {
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  sentBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: Colors.backgroundGray,
    borderBottomLeftRadius: 4,
  },
  message: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    lineHeight: 22,
  },
  sentMessage: {
    color: Colors.white,
  },
  receivedMessage: {
    color: Colors.textDark,
  },
  linkText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  sentLink: {
    color: Colors.white,
  },
  receivedLink: {
    color: Colors.primary,
  },
  time: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  receivedTime: {
    color: Colors.textGray,
  },
});

export default ChatBubble;
