import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const PromotionCard = ({ icon, title, description, link, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        {link && <Text style={styles.link}>{link}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginRight: 14,
  },
  icon: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    lineHeight: 18,
    marginVertical: 8,
  },
  link: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: Colors.textBlack,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },
});

export default PromotionCard;
