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
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts } from '../../constants/Constants';

const LocationMapScreen = ({ navigation, route }) => {
  const { latitude, longitude, title, location } = route.params || {};
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const lat = parseFloat(latitude) || 24.8607;
  const lng = parseFloat(longitude) || 67.0011;
  const locTitle = title || 'Location';
  const locAddress = location || '';

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
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; }
        #map { width: 100%; height: 100%; }
        
        .custom-marker {
          background: #27AE60;
          border: 3px solid #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .leaflet-popup-content {
          margin: 0;
          min-width: 200px;
        }

        .popup-card {
          padding: 14px 16px;
        }

        .popup-title {
          font-weight: bold;
          font-size: 15px;
          color: #333;
          margin-bottom: 4px;
        }

        .popup-location {
          font-size: 12px;
          color: #666;
        }

        .popup-directions {
          display: block;
          background: #27AE60;
          color: #fff;
          text-align: center;
          padding: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          margin-top: 8px;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 16);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        var customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        var marker = L.marker([${lat}, ${lng}], { icon: customIcon }).addTo(map);
        
        var popupHTML = 
          '<div class="popup-card">' +
            '<div class="popup-title">${locTitle.replace(/'/g, "\\'")}</div>' +
            ${
              locAddress
                ? `'<div class="popup-location">📍 ${locAddress.replace(
                    /'/g,
                    "\\'",
                  )}</div>' +`
                : ''
            } 
            '<a class="popup-directions" onclick="getDirections()">Get Directions</a>' +
          '</div>';

        marker.bindPopup(popupHTML, { closeButton: false }).openPopup();

        function getDirections() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'directions' }));
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
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
      console.log('Map message error:', error);
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
    paddingTop:
      Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
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
