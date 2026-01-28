import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '../../constants/Constants';

const AvatarStack = ({
  images = [],
  maxDisplay = 4,
  size = 36,
  overlap = 10,
}) => {
  // Get images to display (limited by maxDisplay)
  const displayImages = images.slice(0, maxDisplay);

  return (
    <View style={styles.container}>
      {displayImages.map((image, index) => (
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
            source={image}
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
      ))}
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
});

export default AvatarStack;
