import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/Constants';

const defaultProfileImage = require('../../assets/images/profile.png');

const AvatarStack = ({
  images = [],
  maxDisplay = 4,
  size = 36,
  overlap = 10,
}) => {
  const displayImages = images.slice(0, maxDisplay);

  return (
    <View style={styles.container}>
      {displayImages.map((item, index) => {
        const isObject = typeof item === 'object' && item !== null && !item.uri;
        const imageUrl = isObject
          ? item.image
          : typeof item === 'string'
          ? item
          : null;
        const hasImage = imageUrl && imageUrl !== null;

        return (
          <View
            key={index}
            style={[
              styles.avatarWrapper,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: index === 0 ? 0 : -overlap,
                zIndex: displayImages.length - index,
              },
            ]}
          >
            <Image
              source={
                hasImage
                  ? typeof imageUrl === 'string'
                    ? { uri: imageUrl }
                    : imageUrl
                  : defaultProfileImage
              }
              style={[
                styles.avatar,
                {
                  width: size - 4,
                  height: size - 4,
                  borderRadius: (size - 4) / 2,
                },
              ]}
              resizeMode="cover"
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: Colors.background,
  },
  initialCircle: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontFamily: Fonts.RobotoBold,
    color: Colors.white,
  },
});

export default AvatarStack;
