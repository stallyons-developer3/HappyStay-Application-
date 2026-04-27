import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const URL_REGEX = /(https?:\/\/[^\s,)>\]]+)/gi;

const parseMessageWithLinks = (text, isSent) => {
  if (!text) return null;

  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return null; // No URLs found

  return parts.map((part, index) => {
    if (URL_REGEX.test(part)) {
      // Reset regex lastIndex since it's global
      URL_REGEX.lastIndex = 0;
      return (
        <Text
          key={index}
          style={[styles.inlineLink, isSent && styles.inlineLinkSent]}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return part;
  });
};

const ChatBubble = ({
  message,
  time,
  isSent = true,
  isLink = false,
  linkText = '',
  linkUrl = '',
}) => {
  const handleLinkPress = () => {
    if (linkUrl) {
      Linking.openURL(linkUrl);
    }
  };

  const parsedMessage = parseMessageWithLinks(message, isSent);

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
          {parsedMessage || message}
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
        {time ? (
          <Text
            style={[styles.time, isSent ? styles.sentTime : styles.receivedTime]}
          >
            {time}
          </Text>
        ) : null}
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    lineHeight: 22,
  },
  sentMessage: {
    color: Colors.white,
  },
  receivedMessage: {
    color: Colors.textDark,
  },
  inlineLink: {
    color: '#1A73E8',
    textDecorationLine: 'underline',
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
  },
  inlineLinkSent: {
    color: '#B3E5FC',
  },
  linkText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  sentLink: {
    color: '#0000FF',
  },
  receivedLink: {
    color: '#0000FF',
  },
  time: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    marginTop: 6,
    alignSelf: 'flex-end',
    color: Colors.white,
  },
  sentTime: {
    color: 'rgba(255, 255, 255)',
  },
  receivedTime: {
    color: Colors.textGray,
  },
});

export default ChatBubble;
