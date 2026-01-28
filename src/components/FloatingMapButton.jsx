import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const FloatingMapButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={require('../assets/images/icons/map.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.text}>Map</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
    marginRight: 8,
  },
  text: {
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 14,
    color: Colors.white,
  },
});

export default FloatingMapButton;
