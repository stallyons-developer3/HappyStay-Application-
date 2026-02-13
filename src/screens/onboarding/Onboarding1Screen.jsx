import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import { setOnboardingData } from '../../store/slices/onboardingSlice';

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

const genders = [
  { id: '1', name: 'Male' },
  { id: '2', name: 'Female' },
  { id: '3', name: 'Other' },
];

const Onboarding1Screen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [date, setDate] = useState(new Date(1999, 9, 18));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [scrollIndicator] = useState(new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState(1);
  const [scrollViewHeight, setScrollViewHeight] = useState(1);

  const scrollIndicatorHeight = 60;
  const scrollTrackHeight = scrollViewHeight - 20;
  const scrollableHeight = contentHeight - scrollViewHeight;
  const indicatorPosition = scrollIndicator.interpolate({
    inputRange: [0, scrollableHeight > 0 ? scrollableHeight : 1],
    outputRange: [0, scrollTrackHeight - scrollIndicatorHeight],
    extrapolate: 'clamp',
  });

  const formatDate = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const formatDateForAPI = d => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const selectCountry = country => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  const selectGender = gender => {
    setSelectedGender(gender);
    setShowGenderModal(false);
  };

  const handleContinue = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (!selectedGender) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }
    if (!selectedCountry) {
      Alert.alert('Error', 'Please select your nationality');
      return;
    }

    dispatch(
      setOnboardingData({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: userName.trim(),
        gender: selectedGender.name,
        nationality: selectedCountry.name,
        age: formatDateForAPI(date),
      }),
    );

    navigation.navigate(Screens.Onboarding3);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Welcome! Let's get started</Text>
        <Text style={styles.subtitle}>
          Please provide the following information to{'\n'}
          create your account. You must be at least 18{'\n'}
          years old to use this app.
        </Text>

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

        <Text style={styles.inputLabel}>Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.inputLabel}>Gender</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setShowGenderModal(true)}
        >
          <Text
            style={selectedGender ? styles.selectedText : styles.dropdownText}
          >
            {selectedGender ? selectedGender.name : 'Select'}
          </Text>
          <Image
            source={require('../../assets/images/arrow-down.png')}
            style={styles.dropdownIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

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

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <Button title="Continue" onPress={handleContinue} size="full" />
      </ScrollView>

      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nationality</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <ScrollView
                style={styles.countryList}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollIndicator } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onLayout={e => setScrollViewHeight(e.nativeEvent.layout.height)}
              >
                {countries.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.countryItem}
                    onPress={() => selectCountry(item)}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.scrollbarTrack}>
                <Animated.View
                  style={[
                    styles.scrollbarThumb,
                    { transform: [{ translateY: indicatorPosition }] },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.genderModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {genders.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.genderItem}
                onPress={() => selectGender(item)}
              >
                <Text style={styles.genderName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: Fonts.RobotoRegular,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  selectedText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  dropdownText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '70%',
    paddingBottom: 30,
  },
  genderModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textGray,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  countryList: {
    flex: 1,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
  genderItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  genderName: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
  scrollbarTrack: {
    width: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
    marginVertical: 10,
  },
  scrollbarThumb: {
    width: 4,
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default Onboarding1Screen;
