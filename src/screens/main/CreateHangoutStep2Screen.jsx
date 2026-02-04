import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts } from '../../constants/Constants';
import Button from '../../components/common/Button';

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

const CreateHangoutStep2Screen = ({ navigation, route }) => {
  const isEdit = route?.params?.isEdit || false;
  const step1Data = route?.params?.step1Data || {};

  const [interest, setInterest] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });

  const [showInterestModal, setShowInterestModal] = useState(false);

  const webViewRef = useRef(null);

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

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = time => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCreate = () => {
    const hangoutFormData = {
      ...step1Data,
      date: formatDate(step1Data.date),
      time: formatTime(step1Data.time),
      interest,
      location,
      coordinates: markerPosition,
      description,
      isPrivate,
    };

    if (isEdit) {
      console.log('Hangout Updated:', hangoutFormData);
    } else {
      console.log('Hangout Created:', hangoutFormData);
    }

    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
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
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Image
              source={require('../../assets/images/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Edit Hangout' : 'Plan a Hangout'}
          </Text>
        </View>

        {/* Interest Dropdown */}
        <Text style={styles.inputLabel}>Interest</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          activeOpacity={0.7}
          onPress={() => setShowInterestModal(true)}
        >
          <Text style={interest ? styles.inputText : styles.placeholderText}>
            {interest ? interest.name : 'Select'}
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
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
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
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Private Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Is it private?</Text>
          <Switch
            value={isPrivate}
            onValueChange={setIsPrivate}
            trackColor={{ false: '#00000050', true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Create / Update Button */}
        <Button
          title={isEdit ? 'Update' : 'Create'}
          onPress={handleCreate}
          size="full"
        />
      </ScrollView>

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

            {interestOptions.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                onPress={() => {
                  setInterest(item);
                  setShowInterestModal(false);
                }}
              >
                <Text style={styles.optionName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginLeft: 8,
  },

  // Input
  inputLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
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
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textDark,
  },

  // Map
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },

  // Text Area
  textAreaContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    minHeight: 120,
  },
  textArea: {
    fontFamily: Fonts.RobotoRegular,
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
    fontFamily: Fonts.RobotoRegular,
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
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionName: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
});

export default CreateHangoutStep2Screen;
