import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const ChatRow = ({ image, title, message, isAI = false, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isAI && styles.aiContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Profile Image */}
      <View style={[styles.imageWrapper, isAI && styles.aiImageWrapper]}>
        <Image source={image} style={styles.profileImage} resizeMode="cover" />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, isAI && styles.aiTitle]} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.message, isAI && styles.aiMessage]}
          numberOfLines={1}
        >
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 0,
  },
  aiContainer: {
    backgroundColor: Colors.primary,
    marginBottom: 8,
  },
  imageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 24,
    overflow: 'hidden',
  },
  aiImageWrapper: {
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 5,
  },
  aiTitle: {
    color: Colors.white,
  },
  message: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  aiMessage: {
    color: Colors.white,
    opacity: 0.9,
  },
});

export default ChatRow;
