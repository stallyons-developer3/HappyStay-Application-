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
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Fonts } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROFILE, STORAGE_URL } from '../../api/endpoints';
import { setUser } from '../../store/slices/authSlice';
import { saveUserData } from '../../utils/storage';
import ImagePicker from 'react-native-image-crop-picker';
import { useToast } from '../../context/ToastContext';

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
  { id: '16', name: 'Italy', flag: '🇮🇹' },
  { id: '17', name: 'Spain', flag: '🇪🇸' },
  { id: '18', name: 'Netherlands', flag: '🇳🇱' },
  { id: '19', name: 'South Korea', flag: '🇰🇷' },
  { id: '20', name: 'Mexico', flag: '🇲🇽' },
];

const genderOptions = [
  { id: '1', name: 'Male' },
  { id: '2', name: 'Female' },
  { id: '3', name: 'Other' },
];

const EditProfileScreen = ({ navigation }) => {
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateSelected, setDateSelected] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

      if (user.gender) {
        const gender = genderOptions.find(
          g => g.name.toLowerCase() === user.gender.toLowerCase(),
        );
        if (gender) setSelectedGender(gender);
      }

      if (user.nationality) {
        const country = countries.find(
          c => c.name.toLowerCase() === user.nationality.toLowerCase(),
        );
        if (country) setSelectedCountry(country);
      }

      if (user.age) {
        const parsedDate = new Date(user.age);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
          setDateSelected(true);
        }
      }

      if (user.profile_picture) {
        setProfileImage(user.profile_picture);
      }
    }
  }, [user]);

  const formatDate = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const formatDateForApi = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
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

  const handlePickImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setProfileImage(image.path);
        setNewImageFile({
          uri: image.path,
          type: image.mime || 'image/jpeg',
          fileName: image.path.split('/').pop(),
        });
      })
      .catch(err => {
        if (err?.code !== 'E_PICKER_CANCELLED') {
          showToast('error', 'Failed to pick image');
        }
      });
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !userName.trim()) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('username', userName.trim());

      if (selectedGender) formData.append('gender', selectedGender.name);
      if (selectedCountry) formData.append('nationality', selectedCountry.name);
      if (dateSelected) formData.append('age', formatDateForApi(date));

      if (newImageFile) {
        formData.append('profile_picture', {
          uri: newImageFile.uri,
          type: newImageFile.type || 'image/jpeg',
          name: newImageFile.fileName || 'profile.jpg',
        });
      }

      const response = await api.post(PROFILE.UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        const updatedUser = response.data.user;
        dispatch(setUser(updatedUser));
        await saveUserData(updatedUser);
        showToast('success', 'Profile updated successfully!'); setTimeout(() => navigation.goBack(), 1000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        'Failed to update profile.';
      showToast('error', errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const getProfileImageSource = () => {
    if (newImageFile) return { uri: profileImage };
    if (profileImage) return { uri: profileImage };
    return require('../../assets/images/profile.png');
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
                source={getProfileImageSource()}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.cameraButton}
            activeOpacity={0.8}
            onPress={handlePickImage}
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
            {dateSelected ? formatDate(date) : 'Select'}
          </Text>
          <Image
            source={require('../../assets/images/calender.png')}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Button
          title={isUpdating ? 'Updating...' : 'Update'}
          onPress={handleSave}
          size="full"
          style={{ marginTop: 10, opacity: isUpdating ? 0.7 : 1 }}
          disabled={isUpdating}
        />

        {isUpdating && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: 15 }}
          />
        )}
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
  input: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    padding: 0,
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
