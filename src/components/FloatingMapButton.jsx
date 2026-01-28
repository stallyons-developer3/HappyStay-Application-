import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/Constants';

const FloatingMapButton = ({ onPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { bottom: insets.bottom }, // Safe area add karo
      ]}
      activeOpacity={0.9}
      onPress={onPress}
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
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: Colors.white,
    marginRight: 8,
  },
  text: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default FloatingMapButton;
