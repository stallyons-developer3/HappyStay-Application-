import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts } from '../../constants/Constants';

const MapScreen = ({ navigation }) => {
  const webViewRef = useRef(null);

  // Default coordinates (Karachi)
  const defaultLocation = {
    latitude: 24.8607,
    longitude: 67.0011,
  };

  // OpenStreetMap HTML with Leaflet
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
          width: 20px;
          height: 20px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }
        
        .leaflet-popup-content {
          margin: 12px 16px;
          font-family: sans-serif;
        }
        
        .popup-title {
          font-weight: bold;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }
        
        .popup-desc {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        var map = L.map('map', {
          zoomControl: false
        }).setView([${defaultLocation.latitude}, ${defaultLocation.longitude}], 14);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        
        // Add zoom control to bottom right
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
        
        // Custom marker icon
        var customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        // Sample markers data
        var locations = [
          {
            lat: 24.8607,
            lng: 67.0011,
            title: 'Beach Party',
            desc: 'Tonight at 8 PM'
          },
          {
            lat: 24.8700,
            lng: 67.0100,
            title: 'Hiking Trail',
            desc: 'Tomorrow 6 AM'
          },
          {
            lat: 24.8550,
            lng: 66.9900,
            title: 'Food Festival',
            desc: 'This Weekend'
          },
          {
            lat: 24.8650,
            lng: 66.9950,
            title: 'Bonfire Night',
            desc: 'Friday 9 PM'
          },
          {
            lat: 24.8750,
            lng: 67.0050,
            title: 'City Tour',
            desc: 'Daily 10 AM'
          }
        ];
        
        // Add markers
        locations.forEach(function(loc) {
          var marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);
          marker.bindPopup(
            '<div class="popup-title">' + loc.title + '</div>' +
            '<div class="popup-desc">' + loc.desc + '</div>'
          );
        });
        
        // Handle map click
        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  // Handle messages from WebView
  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Map event:', data);
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
        <Text style={styles.headerTitle}>Explore Map</Text>
      </View>

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  headerTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
    marginLeft: 8,
  },

  // Map
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
