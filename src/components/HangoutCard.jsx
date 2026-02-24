import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import AvatarStack from './common/AvatarStack';
import Button from './common/Button';

const formatTypology = value => {
  if (!value) return '';
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const HangoutCard = ({
  profileImage,
  name,
  activityType,
  description,
  peopleCount,
  peopleImages = [],
  onPress,
  onJoinPress,
  onChatPress,
  isOwner = false,
  isPublic = false,
  requestStatus = null,
  joinLoading = false,
  canJoin = true,
  canJoinMessage = '',
  showMenu = false,
  onEditPress,
  onDeletePress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const hasImage =
    profileImage &&
    (typeof profileImage === 'string' ||
      (typeof profileImage === 'object' && profileImage.uri));

  const profileSource =
    typeof profileImage === 'string' ? { uri: profileImage } : profileImage;

  const getInitial = n => {
    if (!n) return '?';
    return n.charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        <View style={styles.profileSection}>
          {hasImage ? (
            <Image
              source={profileSource}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.initialCircle}>
              <Text style={styles.initialText}>{getInitial(name)}</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>
        </View>

        {showMenu && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(!menuVisible)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../assets/images/icons/more.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {menuVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.editItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onEditPress && onEditPress();
                  }}
                >
                  <Image
                    source={require('../assets/images/icons/edit.png')}
                    style={[styles.dropdownIcon, { tintColor: '#5B93FF' }]}
                    resizeMode="contain"
                  />
                  <Text style={styles.editText}>edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onDeletePress && onDeletePress();
                  }}
                >
                  <Image
                    source={require('../assets/images/icons/delete.png')}
                    style={[styles.dropdownIcon, { tintColor: '#E71D36' }]}
                    resizeMode="contain"
                  />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <Text style={styles.activityType}>{formatTypology(activityType)}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      <Text style={styles.peopleCount}>
        {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
      </Text>

      <View style={styles.avatarSection}>
        <AvatarStack
          images={peopleImages}
          maxDisplay={4}
          size={40}
          overlap={12}
        />
      </View>

      {isOwner || requestStatus === 'accepted' ? (
        <Button title="Chat" size="full" onPress={onChatPress} />
      ) : requestStatus === 'pending' ? (
        <Button title="Pending" size="full" disabled={true} />
      ) : !canJoin ? (
        <Button
          title={canJoinMessage || 'Cannot Join'}
          size="full"
          disabled={true}
        />
      ) : (
        <Button
          title={isPublic ? 'Join' : 'Request to Join'}
          size="full"
          onPress={onJoinPress}
          loading={joinLoading}
          disabled={joinLoading}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  initialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.white,
  },
  name: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    padding: 0,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 130,
    gap: 8,
  },
  editItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  editText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: '#5B93FF',
  },
  deleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF4F5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  deleteText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: '#E71D36',
    textTransform: 'lowercase',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  activityType: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    lineHeight: 20,
    marginBottom: 12,
  },
  peopleCount: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  avatarSection: {
    marginBottom: 16,
  },
});

export default HangoutCard;
