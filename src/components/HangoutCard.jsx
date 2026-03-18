import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import AvatarStack from './common/AvatarStack';
import HeartIcon from './common/HeartIcon';

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
  title,
  typology,
  description,
  peopleCount,
  peopleImages = [],
  onPress,
  onJoinPress,
  onChatPress,
  onLikePress,
  isOwner = false,
  isPublic = false,
  requestStatus = null,
  joinLoading = false,
  canJoin = true,
  canJoinMessage = '',
  showMenu = false,
  onEditPress,
  onDeletePress,
  isLiked = false,
  likesCount = 0,
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

  const getJoinButtonText = () => {
    if (joinLoading) return 'Sending...';
    if (isOwner || requestStatus === 'accepted') return 'Joined';
    if (requestStatus === 'pending') return 'Pending';
    if (!canJoin) return canJoinMessage || 'Cannot Join';
    return isPublic ? 'Join' : 'Request to Join';
  };

  const isJoinDisabled =
    isOwner ||
    requestStatus === 'accepted' ||
    requestStatus === 'pending' ||
    !canJoin ||
    joinLoading;

  const showChatButton =
    isOwner || requestStatus === 'accepted';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* HANGOUTS badge top-right */}
      <View style={styles.badgeRow}>
        <View style={styles.hangoutBadge}>
          <Text style={styles.hangoutBadgeText}>HANGOUTS</Text>
        </View>
      </View>

      {/* Profile row */}
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

      {/* Typology tag */}
      {typology ? (
        <View style={styles.typologyRow}>
          <View style={styles.typologyTag}>
            <Text style={styles.typologyText}>{formatTypology(typology)}</Text>
          </View>
        </View>
      ) : null}

      {/* Title */}
      {title ? (
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      ) : null}

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      {/* People joined + Like */}
      <View style={styles.peopleRow}>
        <View style={styles.avatarSection}>
          <AvatarStack
            images={peopleImages}
            maxDisplay={3}
            size={32}
            overlap={10}
          />
        </View>
        <View style={styles.peopleRight}>
          <Text style={styles.peopleCount}>
            {peopleCount} {peopleCount === 1 ? 'person' : 'people'} joined
          </Text>
          {onLikePress ? (
            <TouchableOpacity
              style={styles.likeButton}
              onPress={onLikePress}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <HeartIcon size={18} filled={isLiked} />
              {likesCount > 0 ? (
                <Text style={styles.likeCount}>{likesCount}</Text>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.joinButton, isJoinDisabled && styles.disabledButton]}
          activeOpacity={0.8}
          onPress={isJoinDisabled ? (showChatButton ? onChatPress : undefined) : onJoinPress}
          disabled={joinLoading}
        >
          <Text style={styles.joinButtonText}>
            {showChatButton ? 'Joined' : getJoinButtonText()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chatButton, !showChatButton && styles.chatButtonDisabled]}
          activeOpacity={0.8}
          onPress={showChatButton ? onChatPress : undefined}
          disabled={!showChatButton}
        >
          <Text style={[styles.chatButtonText, !showChatButton && styles.chatButtonTextDisabled]}>
            Chat
          </Text>
        </TouchableOpacity>
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
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  hangoutBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hangoutBadgeText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 0.5,
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
  typologyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typologyTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typologyText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 10,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    lineHeight: 20,
    marginBottom: 12,
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peopleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  peopleCount: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: Colors.textGray,
  },
  actionRow: {
    gap: 10,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  chatButton: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  chatButtonDisabled: {
    borderColor: '#ccc',
  },
  chatButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  chatButtonTextDisabled: {
    color: '#ccc',
  },
});

export default HangoutCard;
