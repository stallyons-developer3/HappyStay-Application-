import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Switch,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { Colors, Fonts, GOOGLE_MAPS_API_KEY } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { HANGOUT, ACTIVITY } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const typologyOptions = [
  { id: '1', name: 'Nature & Active' },
  { id: '2', name: 'Sightseeing' },
  { id: '3', name: 'Party' },
  { id: '4', name: 'Events' },
  { id: '5', name: 'Food & Drink' },
  { id: '6', name: 'Transport' },
];


const CreateHangoutScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const { user } = useSelector(state => state.auth);
  const isEdit = route?.params?.isEdit || false;
  const hangoutId = route?.params?.hangoutId || null;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [title, setTitle] = useState('');
  const [typology, setTypology] = useState(null);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [meetingPoint, setMeetingPoint] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const propertyLat = user?.property?.latitude ? parseFloat(user.property.latitude) : 46.1533;
  const propertyLng = user?.property?.longitude ? parseFloat(user.property.longitude) : 9.3244;

  const [markerPosition, setMarkerPosition] = useState({
    latitude: propertyLat,
    longitude: propertyLng,
  });

  const [showTypologyModal, setShowTypologyModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [linkedActivity, setLinkedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const webViewRef = useRef(null);

  useEffect(() => {
    if (isEdit && hangoutId) {
      fetchHangoutForEdit();
    }
  }, [isEdit, hangoutId]);

  const fetchHangoutForEdit = async () => {
    setIsFetching(true);
    try {
      const response = await api.get(HANGOUT.GET_DETAIL(hangoutId));
      if (response.data?.hangout) {
        const h = response.data.hangout;
        setTitle(h.title || '');
        setDescription(h.description || '');
        setLocation(h.location || '');
        setIsPrivate(!!h.is_private);
        setMinAge(h.min_age ? String(h.min_age) : '');
        setMeetingPoint(h.meeting_point || '');

        if (h.typology) {
          const found = typologyOptions.find(
            t => t.name.toLowerCase() === h.typology.toLowerCase(),
          );
          if (found) setTypology(found);
          else setTypology({ id: '0', name: h.typology });
        }

        if (h.date) {
          const d = new Date(h.date);
          if (!isNaN(d.getTime())) setDate(d);
        }

        if (h.time) {
          const parsed = parseTimeString(h.time);
          if (parsed) setTime(parsed);
        }

        if (h.linked_activity) {
          setLinkedActivity(h.linked_activity);
        }

        if (h.latitude && h.longitude) {
          setMarkerPosition({
            latitude: parseFloat(h.latitude),
            longitude: parseFloat(h.longitude),
          });
        }
      }
    } catch (error) {
      showToast('error', 'Failed to load hangout details');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchActivitiesForDate = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await api.get(`${ACTIVITY.GET_ALL}?per_page=100`);
      if (response.data?.activities) {
        const hangoutDateStr = formatDateForAPI(date);
        const filtered = response.data.activities.filter(a => {
          // Open activities (no date) — always available to tag
          if (a.activity_type === 'open' || !a.start_date) return true;
          // Event activities — hangout date must fall within activity dates
          const startDate = a.start_date.slice(0, 10);
          const endDate = (a.end_date || a.start_date).slice(0, 10);
          return hangoutDateStr >= startDate && hangoutDateStr <= endDate;
        });
        setAvailableActivities(filtered);
      }
    } catch (error) {
      setAvailableActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const openActivityPicker = () => {
    setActivitySearch('');
    fetchActivitiesForDate();
    setShowActivityModal(true);
  };

  const parseTimeString = timeStr => {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)?$/);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const d = new Date();
    d.setHours(hours, mins, 0, 0);
    return d;
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.results?.[0]?.formatted_address) {
        setLocation(data.results[0].formatted_address);
      }
    } catch (error) {
    }
  };

  const isToday = d => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        #searchBox {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          z-index: 5;
          background: #fff;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #ddd;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          outline: none;
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <input id="searchBox" type="text" placeholder="Search location..." />
      <div id="map"></div>
      <script>
        function initMap() {
          var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: ${markerPosition.latitude}, lng: ${markerPosition.longitude} },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          var marker = new google.maps.Marker({
            position: { lat: ${markerPosition.latitude}, lng: ${markerPosition.longitude} },
            map: map,
            draggable: true,
          });

          // Search box
          var input = document.getElementById('searchBox');
          var autocomplete = new google.maps.places.Autocomplete(input, { types: ['geocode', 'establishment'] });
          autocomplete.bindTo('bounds', map);
          autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) return;
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            marker.setPosition(place.geometry.location);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            }));
          });

          map.addListener('click', function(e) {
            marker.setPosition(e.latLng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng()
            }));
          });
          marker.addListener('dragend', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng()
            }));
          });
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap" async defer></script>
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
      reverseGeocode(data.latitude, data.longitude);
    } catch (error) {
    }
  };

  const formatDateDisplay = d => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForAPI = d => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeDisplay = t => {
    let hours = t.getHours();
    const minutes = t.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (
        isToday(selectedDate) &&
        time.getHours() * 60 + time.getMinutes() <
          new Date().getHours() * 60 + new Date().getMinutes()
      ) {
        const now = new Date();
        now.setSeconds(0, 0);
        setTime(now);
      }
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      if (isToday(date)) {
        const now = new Date();
        const selectedMinutes =
          selectedTime.getHours() * 60 + selectedTime.getMinutes();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        if (selectedMinutes < nowMinutes) {
          showToast('error', 'You cannot select a past time for today.');
          return;
        }
      }
      setTime(selectedTime);
    }
  };

  const getMinimumTime = () => {
    if (isToday(date)) {
      return new Date();
    }
    return undefined;
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      showToast('error', 'Title is required');
      return false;
    }
    if (!typology) {
      showToast('error', 'Please select a typology');
      return false;
    }
    if (isToday(date)) {
      const now = new Date();
      const selectedMinutes = time.getHours() * 60 + time.getMinutes();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (selectedMinutes < nowMinutes) {
        showToast('error', 'You cannot select a past time for today.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      showToast('error', 'Description is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        typology: typology.name,
        min_age: minAge.trim() ? parseInt(minAge) : null,
        date: formatDateForAPI(date),
        time: formatTimeDisplay(time),
        location: location.trim() || null,
        latitude: markerPosition.latitude || null,
        longitude: markerPosition.longitude || null,
        meeting_point: meetingPoint.trim() || null,
        description: description.trim(),
        is_private: isPrivate,
        activity_id: linkedActivity?.id || null,
      };

      let response;
      if (isEdit) {
        response = await api.post(HANGOUT.UPDATE(hangoutId), payload);
      } else {
        response = await api.post(HANGOUT.CREATE, payload);
      }

      showToast('success', response.data?.message || (isEdit ? 'Hangout updated!' : 'Hangout created!'));
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? errors.join('\n')
        : error.response?.data?.message || 'Something went wrong';
      showToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => { setKeyboardHeight(0); });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderStep1 = () => (
    <View style={styles.step1Container}>
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

      <Text style={styles.subtitle}>
        {isEdit
          ? 'Update the details for your hangout'
          : 'Got a plan? Share it! Add the details below to find your squad and get the group together.'}
      </Text>

      <Text style={styles.inputLabel}>Give your Hangout a catchy name</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <Text style={styles.inputLabel}>Typology</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={() => setShowTypologyModal(true)}
      >
        <Text style={typology ? styles.inputText : styles.placeholderText}>
          {typology ? typology.name : 'Select'}
        </Text>
        <Image
          source={require('../../assets/images/arrow-down.png')}
          style={styles.dropdownIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.inputLabel}>Min Age</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={minAge}
          onChangeText={setMinAge}
          placeholder="e.g. 18"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.inputHint}>Leave empty if no age restriction. Displayed as "18+" in app.</Text>

      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeItemLeft}>
          <Text style={styles.inputLabel}>When?</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatDateDisplay(date)}</Text>
            <Image
              source={require('../../assets/images/icons/calendar-small.png')}
              style={styles.dateTimeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.dateTimeItemRight}>
          <Text style={styles.inputLabel}>At What time?</Text>
          <TouchableOpacity
            style={styles.dateTimeInput}
            activeOpacity={0.7}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeText}>{formatTimeDisplay(time)}</Text>
            <Image
              source={require('../../assets/images/icons/clock.png')}
              style={styles.dateTimeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.inputLabel}>Link an Activity (optional)</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        activeOpacity={0.7}
        onPress={openActivityPicker}
      >
        <Text style={linkedActivity ? styles.inputText : styles.placeholderText} numberOfLines={1}>
          {linkedActivity ? linkedActivity.title : 'Select an activity'}
        </Text>
        {linkedActivity ? (
          <TouchableOpacity onPress={() => setLinkedActivity(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 16, color: Colors.textGray }}>✕</Text>
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../assets/images/arrow-down.png')}
            style={styles.dropdownIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>

      <View style={styles.spacer} />

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={handleNext}
      >
        <Text style={styles.primaryButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 40 : 40 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
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

      <Text style={styles.inputLabel}>Location (optional)</Text>
      <View style={[styles.inputContainer, styles.disabledInput]}>
        <TextInput
          style={styles.input}
          value={location}
          placeholder="Tap on map to select location"
          placeholderTextColor={Colors.textLight}
          editable={false}
        />
      </View>

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

      <Text style={styles.inputLabel}>Meeting Point</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={meetingPoint}
          onChangeText={setMeetingPoint}
          placeholder="e.g. Hotel lobby, Main entrance..."
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <Text style={styles.inputLabel}>Brief Description – Tell them more</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="What's the plan?"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Is it private?</Text>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: '#00000050', true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {isSubmitting && (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginBottom: 10 }}
        />
      )}

      <TouchableOpacity
        style={[styles.primaryButton, isSubmitting && { opacity: 0.6 }]}
        activeOpacity={0.8}
        onPress={handleCreate}
        disabled={isSubmitting}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting
            ? isEdit
              ? 'Updating...'
              : 'Creating...'
            : isEdit
            ? 'Update'
            : 'Create'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {currentStep === 1 ? renderStep1() : renderStep2()}

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          minimumDate={getMinimumTime()}
        />
      )}

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

      <Modal
        visible={showActivityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link an Activity</Text>
              <TouchableOpacity onPress={() => setShowActivityModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.activitySearchInput}
              placeholder="Search activities..."
              placeholderTextColor={Colors.textLight}
              value={activitySearch}
              onChangeText={setActivitySearch}
            />
            {isLoadingActivities ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <FlatList
                data={availableActivities.filter(a =>
                  a.title.toLowerCase().includes(activitySearch.toLowerCase())
                )}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.activityPickerItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setLinkedActivity(item);
                      setShowActivityModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityPickerTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.activityPickerDate}>
                        {item.start_date}{item.end_date && item.end_date !== item.start_date ? ` - ${item.end_date}` : ''}
                      </Text>
                    </View>
                    {item.typology_color && (
                      <View style={[styles.activityPickerBadge, { backgroundColor: item.typology_color }]}>
                        <Text style={styles.activityPickerBadgeText}>
                          {(item.typology || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.activityPickerEmpty}>
                    No activities found for {formatDateDisplay(date)}
                  </Text>
                }
                showsVerticalScrollIndicator={false}
              />
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  step1Container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  inputHint: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 11,
    color: Colors.textLight,
    marginTop: -8,
    marginBottom: 12,
    fontStyle: 'italic',
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
    minHeight: 50,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
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
  ageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ageItem: {
    flex: 0.47,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#00000050',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    minHeight: 50,
  },
  dateTimeIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.textGray,
    marginLeft: 8,
  },
  dateTimeText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  spacer: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.white,
    textTransform: 'lowercase',
  },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  map: {
    flex: 1,
  },
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
    padding: 0,
    minHeight: 90,
  },
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
    fontFamily: Fonts.RobotoBold,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textDark,
  },
  activitySearchInput: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
  },
  activityPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityPickerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
  },
  activityPickerDate: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  activityPickerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  activityPickerBadgeText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 9,
    color: '#fff',
    textTransform: 'uppercase',
  },
  activityPickerEmpty: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default CreateHangoutScreen;
