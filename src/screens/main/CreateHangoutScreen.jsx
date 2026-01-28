import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  FlatList,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import { Colors, Fonts } from '../../constants/Constants';

// Typology Options
const typologyOptions = [
  { id: '1', name: 'Nature & Active' },
  { id: '2', name: 'Sightseeing' },
  { id: '3', name: 'Party' },
  { id: '4', name: 'Events' },
  { id: '5', name: 'Food & Drink' },
  { id: '6', name: 'Transport' },
];

// Interest Options
const interestOptions = [
  { id: '1', name: 'Hiking' },
  { id: '2', name: 'Swimming' },
  { id: '3', name: 'Camping' },
  { id: '4', name: 'Beach Party' },
  { id: '5', name: 'Bonfire' },
  { id: '6', name: 'City Tour' },
  { id: '7', name: 'Food Tasting' },
  { id: '8', name: 'Night Club' },
];

const CreateHangoutScreen = ({ navigation }) => {
  // Current Step
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form Data
  const [title, setTitle] = useState('');
  const [typology, setTypology] = useState(null);
  const [ageLimit, setAgeLimit] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  // Step 2 Form Data
  const [interest, setInterest] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Map Coordinates
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });

  // Modal States
  const [showTypologyModal, setShowTypologyModal] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // WebView Ref
  const webViewRef = useRef(null);

  // OpenStreetMap HTML with Leaflet
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${markerPosition.latitude}, ${markerPosition.longitude}], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        
        var marker = L.marker([${markerPosition.latitude}, ${markerPosition.longitude}]).addTo(map);
        
        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  // Handle Map Message
  const handleMapMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setMarkerPosition({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (error) {
      console.log('Map message error:', error);
    }
  };

  // Format Date
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format Time
  const formatTime = time => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle Date Change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Handle Time Change
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  // Handle Next
  const handleNext = () => {
    setCurrentStep(2);
  };

  // Handle Create
  const handleCreate = () => {
    const hangoutData = {
      title,
      typology,
      ageLimit,
      date: formatDate(date),
      time: formatTime(time),
      interest,
      location,
      coordinates: markerPosition,
      description,
      isPrivate,
    };
    console.log('Hangout Created:', hangoutData);
    navigation.goBack();
  };

  // Render Dropdown Item
  const renderDropdownItem = (item, onSelect, closeModal) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        onSelect(item);
        closeModal();
      }}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render Step 1
  const renderStep1 = () => (
    <>
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Set up the details for your hangout and{'\n'}invite others to join
      </Text>

      {/* Title Input */}
      <Text style={styles.inputLabel}>Title</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Typology Dropdown */}
      <Text style={styles.inputLabel}>Typology</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={() => setShowTypologyModal(true)}
      >
        <Text style={typology ? styles.inputText : styles.placeholderText}>
          {typology ? typology.name : ''}
        </Text>
        <Image
          source={require('../../assets/images/arrow-down.png')}
          style={styles.dropdownIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Age Limit Input */}
      <Text style={styles.inputLabel}>Age Limit</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={ageLimit}
          onChangeText={setAgeLimit}
        />
      </View>

      {/* Date & Time Row */}
      <View style={styles.dateTimeRow}>
        {/* Date */}
        <View style={styles.dateTimeItemLeft}>
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>{formatDate(date)}</Text>
          </TouchableOpacity>
        </View>

        {/* Time */}
        <View style={styles.dateTimeItemRight}>
          <Text style={styles.inputLabel}>Time</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            activeOpacity={0.7}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.inputText}>{formatTime(time)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Next Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={handleNext}
      >
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </>
  );

  // Render Step 2
  const renderStep2 = () => (
    <>
      {/* Interest Dropdown */}
      <Text style={styles.inputLabel}>Interest</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={() => setShowInterestModal(true)}
      >
        <Text style={interest ? styles.inputText : styles.placeholderText}>
          {interest ? interest.name : ''}
        </Text>
        <Image
          source={require('../../assets/images/arrow-down.png')}
          style={styles.dropdownIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Location Input */}
      <Text style={styles.inputLabel}>Location</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* OpenStreetMap */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleMapMessage}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      </View>

      {/* Description */}
      <Text style={styles.inputLabel}>Description</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Private Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>
          Is it private or just a public hangout?
        </Text>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: '#00000050', true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={handleCreate}
      >
        <Text style={styles.primaryButtonText}>Create</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (currentStep === 2) {
                setCurrentStep(1);
              } else {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan a Hangout</Text>
        </View>

        {/* Form Content */}
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {/* Typology Modal */}
      <Modal
        visible={showTypologyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypologyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Typology</Text>
              <TouchableOpacity onPress={() => setShowTypologyModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={typologyOptions}
              keyExtractor={item => item.id}
              renderItem={({ item }) =>
                renderDropdownItem(item, setTypology, () =>
                  setShowTypologyModal(false),
                )
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Interest Modal */}
      <Modal
        visible={showInterestModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInterestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Interest</Text>
              <TouchableOpacity onPress={() => setShowInterestModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={interestOptions}
              keyExtractor={item => item.id}
              renderItem={({ item }) =>
                renderDropdownItem(item, setInterest, () =>
                  setShowInterestModal(false),
                )
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
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
  headerTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginLeft: 8,
  },

  // Subtitle
  subtitle: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Input
  inputLabel: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00000050',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
  },
  inputText: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  placeholderText: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textDark,
  },

  // Date & Time Row
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItemLeft: {
    flex: 0.45,
  },
  dateTimeItemRight: {
    flex: 0.5,
  },
  dateTimeInput: {
    borderWidth: 1.5,
    borderColor: '#00000050',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },

  // Spacer
  spacer: {
    flex: 1,
    minHeight: 120,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
  },

  // Map
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00000050',
  },
  map: {
    flex: 1,
  },

  // Text Area
  textAreaContainer: {
    borderWidth: 1.5,
    borderColor: '#00000050',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    minHeight: 120,
  },
  textArea: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
    minHeight: 90,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleLabel: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textBlack,
    flex: 1,
    marginRight: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '60%',
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
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
});

export default CreateHangoutScreen;
