import React from 'react';
import {
  View,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const { width } = Dimensions.get('window');

const SearchBar = ({
  placeholder = 'Find your activity',
  value,
  onChangeText,
  onSearch,
  onActionPress,
  showActionButton = true,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Search Input Section */}
        <View style={styles.searchSection}>
          <Image
            source={require('../assets/images/icons/search.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSearch}
            returnKeyType="search"
          />
        </View>

        {/* Action Button */}
        {showActionButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            activeOpacity={0.8}
          >
            <Image
              source={require('../assets/images/icons/filter.png')}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 50,
    padding: 15,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    borderRadius: 50,
  },
  searchIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.primary,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
    paddingVertical: 8,
  },
  actionButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
});

export default SearchBar;
