import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts, GOOGLE_MAPS_API_KEY } from '../../constants/Constants';

const LocationMapScreen = ({ navigation, route }) => {
  const { latitude, longitude, title, location, markerColor } = route.params || {};
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const lat = parseFloat(latitude) || 24.8607;
  const lng = parseFloat(longitude) || 67.0011;
  const locTitle = title || 'Location';
  const locAddress = location || '';
  const pinColor = markerColor || '#27AE60';

  const openInExternalMap = () => {
    const label = encodeURIComponent(locTitle);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      );
    });
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function initMap() {
          var map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: ${lat}, lng: ${lng} },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          });

          var marker = new google.maps.Marker({
            position: { lat: ${lat}, lng: ${lng} },
            map: map,
          });

          var infoContent = '<div style="padding:10px 12px;min-width:180px;">' +
            '<div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:4px;">${locTitle.replace(/'/g, "\\'")}</div>' +
            ${locAddress ? `'<div style="font-size:12px;color:#666;">📍 ${locAddress.replace(/'/g, "\\'")}</div>' +` : ''}
            '<div onclick="getDirections()" style="display:block;background:${pinColor};color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:600;margin-top:8px;border-radius:8px;cursor:pointer;">Get Directions</div>' +
            '</div>';

          var infoWindow = new google.maps.InfoWindow({ content: infoContent });
          infoWindow.open(map, marker);
          marker.addListener('click', function() { infoWindow.open(map, marker); });

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        }

        function getDirections() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'directions' }));
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
    </body>
    </html>
  `;

  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapReady') {
        setLoading(false);
      } else if (data.type === 'directions') {
        openInExternalMap();
      }
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {locTitle}
          </Text>
          {locAddress ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {locAddress}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={openInExternalMap}
          activeOpacity={0.7}
        >
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10,
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
  headerTextContainer: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 17,
    color: Colors.textBlack,
  },
  headerSubtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 1,
  },
  directionsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  directionsText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 13,
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    marginTop: 12,
  },
});

export default LocationMapScreen;
