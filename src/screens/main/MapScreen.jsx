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
import { Colors, Fonts, Screens, GOOGLE_MAPS_API_KEY } from '../../constants/Constants';
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Send markers to WebView once map is ready and activities are loaded
  useEffect(() => {
    if (mapReady && !loading && webViewRef.current) {
      if (activities.length > 0) {
        const markersJSON = JSON.stringify(
          activities.map(a => ({
            id: a.id,
            lat: parseFloat(a.latitude),
            lng: parseFloat(a.longitude),
            title: a.title || 'Activity',
            location: a.location || '',
            typology: a.typology || '',
            typology_color: a.typology_color || '#27AE60',
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
      } else {
        // No activities — hide the HTML loading overlay
        webViewRef.current.injectJavaScript(`
          document.getElementById('loading').style.display = 'none';
          true;
        `);
      }
    }
  }, [mapReady, activities, loading]);

  // Google Maps HTML
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        * { margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; }
        #map { width: 100%; height: 100%; }
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
        var map, markers = [], bounds;

        function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 24.8607, lng: 67.0011 },
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          });
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        }

        function addMarkers(locations) {
          // Clear existing markers
          markers.forEach(function(m) { m.setMap(null); });
          markers = [];
          bounds = new google.maps.LatLngBounds();

          locations.forEach(function(loc) {
            if (!loc.lat || !loc.lng) return;

            var markerColor = loc.typology_color || '#27AE60';
            var marker = new google.maps.Marker({
              position: { lat: loc.lat, lng: loc.lng },
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 3,
                scale: 10,
              },
            });

            var meta = '';
            if (loc.date) meta += loc.date;
            if (loc.time) meta += (meta ? ' • ' : '') + loc.time;

            var infoContent =
              '<div style="padding:10px 12px;min-width:180px;cursor:pointer;" onclick="onMarkerTap(' + loc.id + ')">' +
                '<div style="font-weight:bold;font-size:14px;color:#333;margin-bottom:4px;">' + loc.title + '</div>' +
                (loc.location ? '<div style="font-size:12px;color:#666;margin-bottom:3px;">📍 ' + loc.location + '</div>' : '') +
                (meta ? '<div style="font-size:11px;color:#888;margin-bottom:6px;">' + meta + '</div>' : '') +
                (loc.typology ? '<span style="display:inline-block;background:' + markerColor + '20;color:' + markerColor + ';font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;">' + loc.typology + '</span>' : '') +
                '<div style="font-size:10px;color:#26B16D;text-align:right;margin-top:6px;font-weight:600;">Tap to view →</div>' +
              '</div>';

            var infoWindow = new google.maps.InfoWindow({ content: infoContent });
            marker.addListener('click', function() {
              infoWindow.open(map, marker);
            });

            markers.push(marker);
            bounds.extend(marker.getPosition());
          });

          if (markers.length > 0) {
            map.fitBounds(bounds, { top: 50, bottom: 50, left: 30, right: 30 });
          }

          document.getElementById('loading').style.display = 'none';
        }

        function onMarkerTap(activityId) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'activityTap',
            activityId: activityId
          }));
        }
      </script>
      <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
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
        {!loading && activities.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyTitle}>No Activities Found</Text>
            <Text style={styles.emptySubtitle}>
              There are no public activities available for your property right now.
            </Text>
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
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 18,
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MapScreen;
