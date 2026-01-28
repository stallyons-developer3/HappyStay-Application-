import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';

// Countries Data with Flags
const countries = [
  { id: '1', name: 'Indonesia', flag: '🇮🇩' },
  { id: '2', name: 'Pakistan', flag: '🇵🇰' },
  { id: '3', name: 'India', flag: '🇮🇳' },
  { id: '4', name: 'United States', flag: '🇺🇸' },
  { id: '5', name: 'United Kingdom', flag: '🇬🇧' },
  { id: '6', name: 'Canada', flag: '🇨🇦' },
  { id: '7', name: 'Australia', flag: '🇦🇺' },
  { id: '8', name: 'Germany', flag: '🇩🇪' },
  { id: '9', name: 'France', flag: '🇫🇷' },
  { id: '10', name: 'Japan', flag: '🇯🇵' },
  { id: '11', name: 'China', flag: '🇨🇳' },
  { id: '12', name: 'Brazil', flag: '🇧🇷' },
  { id: '13', name: 'Saudi Arabia', flag: '🇸🇦' },
  { id: '14', name: 'UAE', flag: '🇦🇪' },
  { id: '15', name: 'Turkey', flag: '🇹🇷' },
];

const Onboarding1Screen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');

  // Nationality State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Date State
  const [date, setDate] = useState(new Date(1999, 9, 18));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format Date
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Handle Date Change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Select Country
  const selectCountry = country => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  // Render Country Item
  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectCountry(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.title}>Welcome! Let's get started</Text>
        <Text style={styles.subtitle}>
          Please provide the following information to{'\n'}
          create your account. You must be at least 18{'\n'}
          years old to use this app.
        </Text>

        {/* Profile Picture with Ring */}
        <View style={styles.profileContainer}>
          <View style={styles.profileRing}>
            <View style={styles.profileImageWrapper}>
              <Image
                source={require('../../assets/images/profile.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.cameraButton}>
            <Image
              source={require('../../assets/images/camera.png')}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* First Name Input */}
        <Text style={styles.inputLabel}>First Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        {/* Last Name Input */}
        <Text style={styles.inputLabel}>Last Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        {/* User Name Input */}
        <Text style={styles.inputLabel}>User Name</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        {/* Nationality Dropdown */}
        <Text style={styles.inputLabel}>Nationality</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setShowCountryModal(true)}
        >
          <View style={styles.dropdownContent}>
            {selectedCountry ? (
              <>
                <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.selectedCountryText}>
                  {selectedCountry.name}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.flagPlaceholder} />
                <Text style={styles.dropdownText}>Select</Text>
              </>
            )}
          </View>
          <Image
            source={require('../../assets/images/arrow-down.png')}
            style={styles.dropdownIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Age Date Picker */}
        <Text style={styles.inputLabel}>Age</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Image
            source={require('../../assets/images/calender.png')}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Screens.Onboarding2)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nationality</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Country List */}
            <FlatList
              data={countries}
              keyExtractor={item => item.id}
              renderItem={renderCountryItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textBlack,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  profileRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageWrapper: {
    width: 115,
    height: 115,
    borderRadius: 57.5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '32%',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 36,
    height: 36,
  },
  inputLabel: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  dropdownContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF0000',
    marginRight: 10,
  },
  selectedFlag: {
    fontSize: 24,
    marginRight: 10,
  },
  selectedCountryText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  dropdownText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textDark,
  },
  dateText: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.textBlack,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textGray,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 15,
  },
  countryName: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
});

export default Onboarding1Screen;
