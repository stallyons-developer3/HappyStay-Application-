import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts } from '../../constants/Constants';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  // Get button style based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  // Get text style based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineButtonText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  // Get size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'full':
        return styles.fullButton;
      default:
        return styles.largeButton;
    }
  };

  // Get text size style
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      default:
        return styles.largeText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            getTextStyle(),
            getTextSizeStyle(),
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Variants
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  outlineButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
  },

  // Sizes
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  fullButton: {
    paddingVertical: 15,
    width: '100%',
  },

  // Text Styles
  buttonText: {
    fontFamily: Fonts.poppinsBold,
    textTransform: 'lowercase',
  },
  primaryButtonText: {
    color: Colors.white,
  },
  outlineButtonText: {
    color: Colors.primary,
  },
  textButtonText: {
    color: Colors.primary,
  },

  // Text Sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 20,
  },

  // Disabled
  disabledButton: {
    backgroundColor: Colors.textLight,
    borderColor: Colors.textLight,
  },
  disabledText: {
    color: Colors.white,
  },
});

export default Button;
