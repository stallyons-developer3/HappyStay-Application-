import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const ToastContext = createContext({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = 3500;

const TOAST_CONFIG = {
  success: {
    bg: '#E8F8F0',
    border: '#26B16D',
    text: '#1A7D4B',
    icon: require('../assets/images/icons/check-circle.png'),
    fallbackEmoji: '✓',
  },
  error: {
    bg: '#FEF2F2',
    border: '#EF4444',
    text: '#B91C1C',
    icon: null,
    fallbackEmoji: '✕',
  },
  info: {
    bg: '#EFF6FF',
    border: '#3B82F6',
    text: '#1D4ED8',
    icon: null,
    fallbackEmoji: 'ℹ',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    text: '#92400E',
    icon: null,
    fallbackEmoji: '⚠',
  },
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (type, message, title) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({ type: type || 'error', message, title });

      translateY.setValue(-100);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, TOAST_DURATION);
    },
    [translateY, opacity, hideToast],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const config = toast ? TOAST_CONFIG[toast.type] || TOAST_CONFIG.error : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              opacity,
              backgroundColor: config.bg,
              borderLeftColor: config.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.toastContent}
            activeOpacity={0.8}
            onPress={hideToast}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: config.border }]}
            >
              {config.icon ? (
                <Image
                  source={config.icon}
                  style={styles.toastIcon}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.iconEmoji}>{config.fallbackEmoji}</Text>
              )}
            </View>
            <View style={styles.textContainer}>
              {toast.title && (
                <Text style={[styles.toastTitle, { color: config.text }]}>
                  {toast.title}
                </Text>
              )}
              <Text
                style={[styles.toastMessage, { color: config.text }]}
                numberOfLines={3}
              >
                {toast.message}
              </Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: config.text }]}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 99999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  iconEmoji: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    marginBottom: 2,
  },
  toastMessage: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ToastContext;
