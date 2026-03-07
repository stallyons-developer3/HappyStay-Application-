import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROPERTY } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ navigation, route }) => {
  const { showToast } = useToast();
  const { propertyId } = route.params || {};

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [checkInSelected, setCheckInSelected] = useState(false);
  const [checkOutSelected, setCheckOutSelected] = useState(false);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Menu Image Viewer
  const [menuImages, setMenuImages] = useState([]);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // Section toggles (all collapsed by default)
  const [expandedSections, setExpandedSections] = useState({});
  // Amenity subcategory toggles (all collapsed by default)
  const [expandedAmenities, setExpandedAmenities] = useState({});

  // Fetch property (detailed = true)
  useEffect(() => {
    if (propertyId) fetchPropertyDetail();
  }, [propertyId]);

  const fetchPropertyDetail = async () => {
    try {
      const response = await api.get(PROPERTY.GET_DETAIL(propertyId));
      if (response.data?.success) {
        setProperty(response.data.property);
      }
    } catch (error) {
      console.log('Fetch property detail error:', error);
      showToast('error', 'Failed to load property details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format helpers (exact match to web Blade)
  const formatTypology = typology => {
    if (!typology) return '';
    if (typology === 'b_and_b') return 'B&B';
    return typology.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRoomTypes = roomTypes => {
    if (!roomTypes || !Array.isArray(roomTypes) || roomTypes.length === 0)
      return '';
    return roomTypes
      .map(r => r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .join(', ');
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const formatDateForApi = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // Date handlers
  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      setCheckInSelected(true);
      if (selectedDate >= checkOutDate) setCheckOutSelected(false);
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
      setCheckOutSelected(true);
    }
  };

  const handleGetDirection = () => {
    if (property?.latitude && property?.longitude) {
      navigation.navigate(Screens.LocationMap, {
        latitude: property.latitude,
        longitude: property.longitude,
        title: property.name || 'Property',
        location: property.location || '',
      });
    } else {
      showToast('info', 'No coordinates available for this property.');
    }
  };

  const handleRequestBooking = () => {
    if (property?.user_request_status) {
      showToast('info', `Your booking status: ${property.user_request_status}`);
      return;
    }
    setCheckInSelected(false);
    setCheckOutSelected(false);
    setCheckInDate(new Date());
    setCheckOutDate(new Date());
    setShowBookingModal(true);
  };

  const handleBookNow = async () => {
    if (!checkInSelected || !checkOutSelected) {
      showToast('error', 'Please select both check-in and check-out dates.');
      return;
    }
    if (checkOutDate <= checkInDate) {
      showToast('error', 'Check-out date must be after check-in date.');
      return;
    }

    setIsBooking(true);
    try {
      const response = await api.post(PROPERTY.BOOK(propertyId), {
        check_in: formatDateForApi(checkInDate),
        check_out: formatDateForApi(checkOutDate),
      });

      if (response.data?.success) {
        setShowBookingModal(false);
        showToast('success', response.data.message || 'Booking request sent!');
        setProperty(prev => ({ ...prev, user_request_status: 'pending' }));
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to send booking request.';
      showToast('error', errorMsg);
    } finally {
      setIsBooking(false);
    }
  };

  const getButtonText = () => {
    if (!property?.user_request_status) return 'Request Booking';
    switch (property.user_request_status) {
      case 'pending':
        return 'Booking Pending...';
      case 'accepted':
        return 'Booking Accepted ✓';
      case 'declined':
        return 'Booking Declined ✕';
      default:
        return 'Request Booking';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Collect all menu images for fullscreen viewer
  const allMenuImages = property.opening_hours
    ? property.opening_hours.reduce((acc, hour) => {
        const menus = Array.isArray(hour.menu)
          ? hour.menu
          : hour.menu
          ? [hour.menu]
          : [];
        return [...acc, ...menus];
      }, [])
    : [];

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAmenityCategory = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isAccepted = property.user_request_status === 'accepted';

  // Section helpers
  const hasContactInfo = property.assistance_number || property.emergency_number || (isAccepted && property.location);
  const hasAccessInfo = property.wifi_network || property.checkin_time || property.checkout_time || property.night_access_code || property.self_checkin_instructions;
  const hasOperatingHours = property.opening_hours && property.opening_hours.length > 0;
  const hasHouseRules = property.house_rules && property.house_rules.length > 0;
  const hasMenus = allMenuImages.length > 0 || property.kitchen_usage_rules || property.laundry_instructions;

  const SectionHeader = ({ title, sectionKey }) => {
    const isOn = !!expandedSections[sectionKey];
    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(sectionKey)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={[styles.toggleTrack, isOn && styles.toggleTrackOn]}>
          <View style={[styles.toggleThumb, isOn && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE */}
        <View style={styles.imageContainer}>
          <Image
            source={
              property.thumbnail
                ? { uri: property.thumbnail }
                : require('../../assets/images/villa.png')
            }
            style={styles.heroImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/icons/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {property.user_request_status && (
            <View
              style={[
                styles.statusBadge,
                property.user_request_status === 'accepted' &&
                  styles.statusAccepted,
                property.user_request_status === 'declined' &&
                  styles.statusDeclined,
                property.user_request_status === 'pending' &&
                  styles.statusPending,
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {property.user_request_status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* PROPERTY NAME */}
          <Text style={styles.mainTitle}>{property.name}</Text>

          {/* ==================== PROPERTY INFO (P13 - PUBLIC, always visible) ==================== */}
          {(property.typology ||
            property.short_description ||
            (property.room_types && property.room_types.length > 0) ||
            property.age_limit_enabled) && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Property Info</Text>
              <View style={styles.propertyInfoContainer}>
                {property.typology && (
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Type: </Text>
                    {formatTypology(property.typology)}
                  </Text>
                )}
                {property.room_types && property.room_types.length > 0 && (
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Room Types: </Text>
                    {formatRoomTypes(property.room_types)}
                  </Text>
                )}
                {property.age_limit_enabled && property.min_age && (
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Age Limit: </Text>
                    {property.min_age}+
                  </Text>
                )}
                {property.short_description && (
                  <Text style={styles.descriptionText}>
                    {property.short_description}
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ==================== AMENITIES (PUBLIC, always visible with +/- subcategories) ==================== */}
          {property.amenities && Object.keys(property.amenities).length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Amenities</Text>
              {Object.entries(property.amenities).map(([category, items]) => {
                const isExpanded = !!expandedAmenities[category];
                return (
                  <View key={category} style={styles.amenityCategory}>
                    <TouchableOpacity
                      style={styles.amenityCategoryHeader}
                      onPress={() => toggleAmenityCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categorySubtitle}>{category}</Text>
                      <Text style={styles.plusMinusIcon}>{isExpanded ? '−' : '+'}</Text>
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.amenitiesGrid}>
                        {items.map((label, idx) => (
                          <View key={idx} style={styles.amenityItem}>
                            <Image
                              source={require('../../assets/images/icons/check-circle.png')}
                              style={styles.amenityIcon}
                              resizeMode="contain"
                            />
                            <Text style={styles.amenityText}>{label}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* ==================== SECTION 1: CONTACT & EMERGENCIES (ACCEPTED ONLY) ==================== */}
          {isAccepted && hasContactInfo && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Contact & Emergencies" sectionKey="contact" />
              {expandedSections.contact && (
                <View style={styles.sectionContent}>
                  {property.assistance_number && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>24h Assistance: </Text>
                        {property.assistance_number}
                      </Text>
                    </View>
                  )}
                  {property.emergency_number && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Emergency Number: </Text>
                        {property.emergency_number}
                      </Text>
                    </View>
                  )}
                  {property.location && (
                    <View style={styles.directionsRow}>
                      <View style={styles.addressRow}>
                        <Image
                          source={require('../../assets/images/icons/map-pin.png')}
                          style={styles.directionIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.addressText}>{property.location}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.getDirectionButton}
                        onPress={handleGetDirection}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={require('../../assets/images/icons/direction.png')}
                          style={styles.directionButtonIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.getDirectionText}>get direction</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {/* ==================== SECTION 2: ACCESS & ENTRY (ACCEPTED ONLY) ==================== */}
          {isAccepted && hasAccessInfo && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Access & Entry" sectionKey="access" />
              {expandedSections.access && (
                <View style={styles.sectionContent}>
                  {property.wifi_network && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>WiFi Network: </Text>
                        {property.wifi_network}
                      </Text>
                    </View>
                  )}
                  {property.wifi_password && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>WiFi Password: </Text>
                        {property.wifi_password}
                      </Text>
                    </View>
                  )}
                  {property.checkin_time && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Check-in Time: </Text>
                        {property.checkin_time}
                      </Text>
                    </View>
                  )}
                  {property.checkout_time && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Check-out Time: </Text>
                        {property.checkout_time}
                      </Text>
                    </View>
                  )}
                  {property.night_access_code && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Night Access: </Text>
                        {property.night_access_code}
                      </Text>
                    </View>
                  )}
                  {property.self_checkin_instructions && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Self Check-in: </Text>
                        {property.self_checkin_instructions}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}

          {/* ==================== SECTION 3: OPERATING HOURS (ACCEPTED ONLY) ==================== */}
          {isAccepted && hasOperatingHours && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Operating Hours" sectionKey="hours" />
              {expandedSections.hours && (
                <View style={styles.sectionContent}>
                  {property.opening_hours.map((hour, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>{hour.title}: </Text>
                        From: {hour.start_time || '-'}  To: {hour.end_time || '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ==================== SECTION 4: HOUSE RULES (ACCEPTED ONLY) ==================== */}
          {isAccepted && hasHouseRules && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="House Rules" sectionKey="rules" />
              {expandedSections.rules && (
                <View style={styles.sectionContent}>
                  {property.house_rules.map((item, index) => (
                    <View key={index} style={styles.bulletItem}>
                      <Image
                        source={require('../../assets/images/icons/check-circle.png')}
                        style={styles.bulletIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.bulletText}>
                        {item.title ? (
                          <>
                            <Text style={styles.infoLabel}>{item.title}: </Text>
                            {item.rule || ''}
                          </>
                        ) : (
                          item.rule || ''
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ==================== SECTION 5: MENUS / FOOD & SERVICES (ACCEPTED ONLY) ==================== */}
          {isAccepted && hasMenus && (
            <>
              <View style={styles.divider} />
              <SectionHeader title="Food & Services" sectionKey="menus" />
              {expandedSections.menus && (
                <View style={styles.sectionContent}>
                  {property.opening_hours && property.opening_hours.map((hour, index) => {
                    const menus = Array.isArray(hour.menu) ? hour.menu : hour.menu ? [hour.menu] : [];
                    if (menus.length === 0) return null;
                    return (
                      <View key={index} style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>{hour.title}</Text>
                        <View style={styles.menuGrid}>
                          {menus.map((img, idx) => {
                            const globalIdx = allMenuImages.indexOf(img);
                            return (
                              <TouchableOpacity
                                key={idx}
                                style={styles.menuGridItem}
                                activeOpacity={0.9}
                                onPress={() => {
                                  setMenuImages(allMenuImages);
                                  setCurrentMenuIndex(globalIdx >= 0 ? globalIdx : idx);
                                  setShowMenuModal(true);
                                }}
                              >
                                <Image
                                  source={{ uri: img }}
                                  style={styles.menuGridImage}
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                  {property.kitchen_usage_rules && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Kitchen Usage Rules: </Text>
                        {property.kitchen_usage_rules}
                      </Text>
                    </View>
                  )}
                  {property.laundry_instructions && (
                    <View style={styles.bulletItem}>
                      <Image source={require('../../assets/images/icons/check-circle.png')} style={styles.bulletIcon} resizeMode="contain" />
                      <Text style={styles.bulletText}>
                        <Text style={styles.infoLabel}>Laundry Instructions: </Text>
                        {property.laundry_instructions}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* BOTTOM BUTTON */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title={getButtonText()}
          onPress={handleRequestBooking}
          size="full"
          disabled={!!property.user_request_status}
        />
      </View>

      {/* BOOKING MODAL */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Booking</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalPropertyName}>{property.name}</Text>

            <Text style={styles.dateLabel}>Check-in</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text
                style={
                  checkInSelected ? styles.dateText : styles.datePlaceholder
                }
              >
                {checkInSelected ? formatDate(checkInDate) : 'Select'}
              </Text>
              <Image
                source={require('../../assets/images/calender.png')}
                style={styles.calendarIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text style={styles.dateLabel}>Check-out</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text
                style={
                  checkOutSelected ? styles.dateText : styles.datePlaceholder
                }
              >
                {checkOutSelected ? formatDate(checkOutDate) : 'Select'}
              </Text>
              <Image
                source={require('../../assets/images/calender.png')}
                style={styles.calendarIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookNowButton, isBooking && { opacity: 0.6 }]}
              onPress={handleBookNow}
              disabled={isBooking}
            >
              {isBooking ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.bookNowText}>Book Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MENU FULLSCREEN MODAL */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.menuModalOverlay}>
          <TouchableOpacity
            style={styles.menuModalClose}
            onPress={() => setShowMenuModal(false)}
          >
            <Text style={styles.menuModalCloseText}>✕</Text>
          </TouchableOpacity>

          {menuImages.length > 0 && (
            <Image
              source={{ uri: menuImages[currentMenuIndex] }}
              style={styles.menuModalImage}
              resizeMode="contain"
            />
          )}

          {menuImages.length > 1 && (
            <View style={styles.menuModalNav}>
              <TouchableOpacity
                onPress={() =>
                  setCurrentMenuIndex(prev =>
                    prev > 0 ? prev - 1 : menuImages.length - 1,
                  )
                }
                style={styles.menuModalNavBtn}
              >
                <Text style={styles.menuModalNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.menuModalCounter}>
                {currentMenuIndex + 1} / {menuImages.length}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCurrentMenuIndex(prev =>
                    prev < menuImages.length - 1 ? prev + 1 : 0,
                  )
                }
                style={styles.menuModalNavBtn}
              >
                <Text style={styles.menuModalNavText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* DATE PICKERS */}
      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckInChange}
          minimumDate={new Date()}
        />
      )}
      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onCheckOutChange}
          minimumDate={checkInDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 16,
    color: Colors.textGray,
    marginBottom: 12,
  },
  goBackText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },

  // Hero
  imageContainer: { position: 'relative', width: '100%', height: 280 },
  heroImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 24, height: 24, tintColor: Colors.white },
  statusBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPending: { backgroundColor: '#FFA500' },
  statusAccepted: { backgroundColor: Colors.primary },
  statusDeclined: { backgroundColor: '#FF4444' },
  statusBadgeText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 11,
    color: Colors.white,
  },

  // Content
  content: { paddingHorizontal: 20, paddingTop: 24 },
  mainTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
  },
  toggleTrack: {
    width: 34,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackOn: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionContent: {
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    flex: 1,
    lineHeight: 22,
  },
  menuSection: {
    marginBottom: 12,
  },
  menuSectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 8,
  },

  // Property Info
  propertyInfoContainer: { marginBottom: 8 },
  infoText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    marginBottom: 6,
  },
  infoLabel: { fontFamily: Fonts.RobotoMedium },
  descriptionText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 20,
    marginTop: 8,
  },


  // Menu Grid
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  menuGridItem: {
    width: (width - 60) / 4,
    height: ((width - 60) / 4) * 1.35,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  menuGridImage: { width: '100%', height: '100%' },

  // Amenities (grouped)
  amenityCategory: { marginBottom: 20 },
  amenityCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categorySubtitle: {
    fontFamily: Fonts.RobotoMedium,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plusMinusIcon: {
    fontSize: 20,
    color: Colors.textGray,
    fontWeight: '700',
  },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    width: (width - 52) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  amenityIcon: { width: 28, height: 28, marginRight: 10 },
  amenityText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textDark,
    flex: 1,
  },

  // Directions
  directionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  directionIcon: { width: 16, height: 16, marginRight: 8 },
  addressText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    flex: 1,
  },
  getDirectionButton: { flexDirection: 'row', alignItems: 'center' },
  directionButtonIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.primary,
    marginRight: 6,
  },
  getDirectionText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.textBlack,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },


  // Bottom spacing & button
  bottomSpacing: { height: 100 },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  modalTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },
  modalCloseButton: { position: 'absolute', right: 0, top: 0 },
  modalClose: { fontSize: 14, color: Colors.textBlack, fontWeight: '700' },
  modalPropertyName: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 16,
  },

  dateLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  dateText: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textDark,
  },
  datePlaceholder: {
    flex: 1,
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  calendarIcon: { width: 24, height: 24, tintColor: Colors.textDark },
  bookNowButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    width: 120,
    alignSelf: 'center',
  },
  bookNowText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 12,
    color: Colors.white,
    textTransform: 'lowercase',
  },

  // Menu Modal
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuModalCloseText: { fontSize: 18, color: Colors.white, fontWeight: '700' },
  menuModalImage: { width: width - 20, height: '75%' },
  menuModalNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    position: 'absolute',
    bottom: 40,
  },
  menuModalNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalNavText: { fontSize: 28, color: Colors.white, fontWeight: '700' },
  menuModalCounter: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: Fonts.RobotoMedium,
  },
});

export default PropertyDetailScreen;
