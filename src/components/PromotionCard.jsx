import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Fonts } from '../constants/Constants';

const defaultIcon = require('../assets/images/icons/promo-icon.png');

const HtmlDescription = ({ html }) => {
  const [webViewHeight, setWebViewHeight] = useState(40);

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, sans-serif;
          font-size: 12px;
          color: #333;
          line-height: 1.6;
          background: transparent;
        }
        ol, ul { padding-left: 20px; margin: 4px 0; }
        li { margin-bottom: 2px; }
        h1 { font-size: 18px; margin: 4px 0; }
        h2 { font-size: 16px; margin: 4px 0; }
        h3 { font-size: 14px; margin: 4px 0; }
        p { margin: 2px 0; }
        a { color: #2EAF7D; }
      </style>
    </head>
    <body>${html}</body>
    <script>
      function sendHeight() {
        const height = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({height: height}));
      }
      sendHeight();
      new MutationObserver(sendHeight).observe(document.body, {childList: true, subtree: true});
    </script>
    </html>
  `;

  const onMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 0) {
        setWebViewHeight(data.height + 4);
      }
    } catch (e) {}
  };

  return (
    <WebView
      source={{ html: wrappedHtml }}
      style={{ height: webViewHeight, opacity: 0.99 }}
      scrollEnabled={false}
      nestedScrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onMessage={onMessage}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      setBuiltInZoomControls={false}
      setDisplayZoomControls={false}
      scalesPageToFit={false}
    />
  );
};

const PromotionCard = ({ icon, title, description, link, onPress }) => {
  const iconSource =
    typeof icon === 'string' ? { uri: icon } : icon || defaultIcon;

  const hasHtml = description && /<[a-z][\s\S]*>/i.test(description);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.iconContainer}>
        <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.content}>
        {description ? (
          hasHtml ? (
            <View style={styles.htmlContainer}>
              <HtmlDescription html={description} />
            </View>
          ) : (
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          )
        ) : null}
        {link && <Text style={styles.link}>{link}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    borderRadius: 25,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginRight: 14,
  },
  icon: {
    width: 50,
    height: 50,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  htmlContainer: {
    marginVertical: 8,
    minHeight: 30,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textBlack,
    lineHeight: 18,
    marginVertical: 8,
  },
  link: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: Colors.textBlack,
    textDecorationLine: 'underline',
    textTransform: 'lowercase',
  },
});

export default PromotionCard;
