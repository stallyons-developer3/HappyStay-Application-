import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { Colors, Fonts } from '../../constants/Constants';
import { STORAGE_URL } from '../../api/endpoints';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROFILE } from '../../api/endpoints';
import { setUser } from '../../store/slices/authSlice';

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

const genderOptions = [
  { id: '1', name: 'Male' },
  { id: '2', name: 'Female' },
  { id: '3', name: 'Other' },
];

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setUserName(user.username || '');
      setDescription(user.description || '');

      if (user.gender) {
        const g = genderOptions.find(
          opt => opt.name.toLowerCase() === user.gender.toLowerCase(),
        );
        if (g) setSelectedGender(g);
      }

      if (user.nationality) {
        const c = countries.find(
          ct => ct.name.toLowerCase() === user.nationality.toLowerCase(),
        );
        if (c) setSelectedCountry(c);
      }

      if (user.age) {
        const d = new Date(user.age);
        if (!isNaN(d.getTime())) {
          setDate(d);
          setDateSelected(true);
        }
      }

      if (user.profile_picture) {
        const uri = user.profile_picture.startsWith('http')
          ? user.profile_picture
          : `${STORAGE_URL}/storage/profile_pictures/${user.profile_picture}`;
        setExistingImage(uri);
      }
    }
  }, [user]);

  const formatDisplayDate = d => {
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
      setDateSelected(true);
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

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setProfileImage(image);
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to pick image');
        }
      });
  };

  const getImageSource = () => {
    if (profileImage) return { uri: profileImage.path };
    if (existingImage) return { uri: existingImage };
    return require('../../assets/images/profile.png');
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('username', userName.trim());

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      if (selectedGender) {
        formData.append('gender', selectedGender.name);
      }

      if (selectedCountry) {
        formData.append('nationality', selectedCountry.name);
      }

      if (dateSelected) {
        formData.append('age', formatDateForAPI(date));
      }

      if (profileImage) {
        const filename = profileImage.path.split('/').pop();
        formData.append('profile_picture', {
          uri: profileImage.path,
          type: profileImage.mime || 'image/jpeg',
          name: filename || 'profile.jpg',
        });
      }

      const response = await api.post(PROFILE.UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.user) {
        dispatch(setUser(response.data.user));
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? errors.join('\n')
        : error.response?.data?.message || 'Update failed. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/icons/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Edit Personal Data</Text>

        <View style={styles.profileContainer}>
          <View style={styles.profileRing}>
            <View style={styles.profileWhiteRing}>
              <Image
                source={getImageSource()}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.cameraButton}
            activeOpacity={0.8}
            onPress={pickImage}
          >
            <Image
              source={require('../../assets/images/camera.png')}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

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

        <Text style={styles.inputLabel}>User Name</Text>
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
            style={selectedGender ? styles.inputText : styles.placeholderText}
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
                <Text style={styles.inputText}>{selectedCountry.name}</Text>
              </>
            ) : (
              <>
                <View style={styles.flagPlaceholder} />
                <Text style={styles.placeholderText}>Select</Text>
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
          <Text
            style={dateSelected ? styles.inputText : styles.placeholderText}
          >
            {dateSelected ? formatDisplayDate(date) : 'Select'}
          </Text>
          <Image
            source={require('../../assets/images/calender.png')}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.inputLabel}>About Me</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell others about yourself..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginVertical: 10 }}
          />
        )}

        <Button
          title={isLoading ? 'Updating...' : 'Update'}
          onPress={handleSave}
          size="full"
          style={{ marginTop: 10, opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

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
            {genderOptions.map(item => (
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 50,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textBlack,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
    alignSelf: 'center',
  },
  profileRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileWhiteRing: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  cameraIcon: {
    width: 36,
    height: 36,
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
  textAreaContainer: {
    borderRadius: 20,
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    padding: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  placeholderText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
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
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textDark,
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

export default EditProfileScreen;
