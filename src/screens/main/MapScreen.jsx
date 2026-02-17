import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import api from '../../api/axiosInstance';
import { ACTIVITY } from '../../api/endpoints';

const MapScreen = ({ navigation }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  // Fetch all public activities
  const fetchActivities = useCallback(async () => {
    try {
      let allActivities = [];
      let page = 1;
      let lastPage = 1;

      // Fetch all pages
      do {
        const response = await api.get(ACTIVITY.GET_ALL, {
          params: { page, per_page: 50 },
        });

        if (response.data?.success) {
          allActivities = [...allActivities, ...response.data.activities];
          lastPage = response.data.pagination?.last_page || 1;
        } else {
          break;
        }
        page++;
      } while (page <= lastPage);

      // Filter: only public activities with valid coordinates
      const publicWithCoords = allActivities.filter(
        a => !a.is_private && a.latitude && a.longitude,
      );

      setActivities(publicWithCoords);
    } catch (error) {
      console.log('Fetch activities for map error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Send markers to WebView once map is ready and activities are loaded
  useEffect(() => {
    if (mapReady && activities.length > 0 && webViewRef.current) {
      const markersJSON = JSON.stringify(
        activities.map(a => ({
          id: a.id,
          lat: parseFloat(a.latitude),
          lng: parseFloat(a.longitude),
          title: a.title || 'Activity',
          location: a.location || '',
          typology: a.typology || '',
          date: a.start_date || '',
          time: a.start_time || '',
          price: a.price || '0.00',
        })),
      );

      webViewRef.current.injectJavaScript(`
        if (typeof addMarkers === 'function') {
          addMarkers(${markersJSON});
        }
        true;
      `);
    }
  }, [mapReady, activities]);

  // Leaflet map HTML
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
          overflow: hidden;
        }
        
        .leaflet-popup-content {
          margin: 0;
          min-width: 180px;
        }
        
        .popup-card {
          padding: 12px 14px;
          cursor: pointer;
        }

        .popup-title {
          font-weight: bold;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }
        
        .popup-location {
          font-size: 12px;
          color: #666;
          margin-bottom: 3px;
        }

        .popup-meta {
          font-size: 11px;
          color: #888;
          margin-bottom: 6px;
        }

        .popup-badge {
          display: inline-block;
          background: #E8F8F0;
          color: #26B16D;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .popup-tap {
          font-size: 10px;
          color: #26B16D;
          text-align: right;
          margin-top: 6px;
          font-weight: 600;
        }

        .loading-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          font-size: 14px;
          color: #666;
          z-index: 1000;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div id="loading" class="loading-overlay">Loading activities...</div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([24.8607, 67.0011], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        var customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        var markersGroup = L.featureGroup();

        function addMarkers(locations) {
          markersGroup.clearLayers();

          locations.forEach(function(loc) {
            if (!loc.lat || !loc.lng) return;

            var meta = '';
            if (loc.date) meta += loc.date;
            if (loc.time) meta += (meta ? ' • ' : '') + loc.time;

            var popupHTML = 
              '<div class="popup-card" onclick="onMarkerTap(' + loc.id + ')">' +
                '<div class="popup-title">' + loc.title + '</div>' +
                (loc.location ? '<div class="popup-location">📍 ' + loc.location + '</div>' : '') +
                (meta ? '<div class="popup-meta">' + meta + '</div>' : '') +
                (loc.typology ? '<span class="popup-badge">' + loc.typology + '</span>' : '') +
                '<div class="popup-tap">Tap to view →</div>' +
              '</div>';

            var marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
            marker.bindPopup(popupHTML, { closeButton: false });
            markersGroup.addLayer(marker);
          });

          markersGroup.addTo(map);

          // Fit map to show all markers
          if (markersGroup.getLayers().length > 0) {
            map.fitBounds(markersGroup.getBounds().pad(0.15));
          }

          document.getElementById('loading').style.display = 'none';
        }

        function onMarkerTap(activityId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'activityTap',
            activityId: activityId
          }));
        }

        // Notify RN that map is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
      </script>
    </body>
    </html>
  `;

  // Handle messages from WebView
  const handleMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setMapReady(true);
      } else if (data.type === 'activityTap' && data.activityId) {
        navigation.navigate(Screens.ActivityDetail, {
          activityId: data.activityId,
        });
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
        <Text style={styles.headerTitle}>Explore Map</Text>
        {activities.length > 0 && (
          <Text style={styles.countBadge}>
            {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
          </Text>
        )}
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
            <Text style={styles.loadingText}>Loading activities...</Text>
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
    flex: 1,
  },
  countBadge: {
    fontFamily: Fonts.poppinsMedium,
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Map
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // Loading
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

export default MapScreen;
