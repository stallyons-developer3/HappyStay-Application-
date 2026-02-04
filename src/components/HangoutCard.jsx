import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import AvatarStack from './common/AvatarStack';
import Button from './common/Button';

const HangoutCard = ({
  profileImage,
  name,
  activityType,
  description,
  peopleCount,
  peopleImages = [],
  onPress,
  onJoinPress,
  showMenu = false,
  onEditPress,
  onDeletePress,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header Row - Profile & Menu */}
      <View style={styles.headerRow}>
        <View style={styles.profileSection}>
          <Image
            source={profileImage}
            style={styles.profileImage}
            resizeMode="cover"
          />
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

            {/* Dropdown Menu */}
            {menuVisible && (
              <View style={styles.dropdown}>
                {/* Edit Item */}
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

                {/* Delete Item */}
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

      {/* Activity Type */}
      <Text style={styles.activityType}>{activityType}</Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      {/* People Count */}
      <Text style={styles.peopleCount}>{peopleCount} peoples</Text>

      {/* Avatar Stack */}
      <View style={styles.avatarSection}>
        <AvatarStack
          images={peopleImages}
          maxDisplay={4}
          size={40}
          overlap={12}
        />
      </View>

      {/* Join Button */}
      <Button
        title="Request to Join"
        size="full"
        onPress={onJoinPress}
      />
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  // Dropdown
  dropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
    minWidth: 130,
    gap: 8,
  },

  // Edit Item
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

  // Delete Item
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

  // Icon
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
