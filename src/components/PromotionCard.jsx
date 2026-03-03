import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {Colors, Fonts} from '../constants/Constants';

const defaultIcon = require('../assets/images/icons/promo-icon.png');

const HtmlDescription = ({html}) => {
  const [webViewHeight, setWebViewHeight] = useState(40);

  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { background: transparent; overflow: hidden; height: auto; }
        #content {
          font-family: -apple-system, sans-serif;
          font-size: 13px;
          color: #333;
          line-height: 1.5;
          display: block;
          overflow: hidden;
        }
        ol, ul { padding-left: 20px; margin: 4px 0; }
        li { margin-bottom: 2px; }
        h1 { font-size: 18px; margin: 4px 0; }
        h2 { font-size: 16px; margin: 4px 0; }
        h3 { font-size: 14px; margin: 4px 0; }
        p { margin: 2px 0; }
        p:empty { display: none; }
        a { color: #2EAF7D; }
      </style>
    </head>
    <body><div id="content">${html}</div></body>
    <script>
      var lastHeight = 0;
      function sendHeight() {
        requestAnimationFrame(function() {
          var el = document.getElementById('content');
          var rect = el.getBoundingClientRect();
          var h = Math.ceil(rect.height);
          if (h !== lastHeight && h > 0) {
            lastHeight = h;
            window.ReactNativeWebView.postMessage(JSON.stringify({height: h}));
          }
        });
      }
      sendHeight();
      window.addEventListener('load', sendHeight);
      setTimeout(sendHeight, 100);
      setTimeout(sendHeight, 300);
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(sendHeight).observe(document.getElementById('content'));
      }
    </script>
    </html>
  `;

  const onMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height && data.height > 0) {
        setWebViewHeight(data.height);
      }
    } catch (e) {}
  };

  return (
    <WebView
      source={{html: wrappedHtml}}
      style={{height: webViewHeight, opacity: 0.99}}
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

const PromotionCard = ({
  propertyIcon,
  propertyName,
  marketingTag,
  description,
  image,
  onPress,
}) => {
  const iconSource =
    typeof propertyIcon === 'string' && propertyIcon
      ? {uri: propertyIcon}
      : propertyIcon || defaultIcon;

  const hasHtml = description && /<[a-z][\s\S]*>/i.test(description);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}>
      {/* Header row: icon + property name + marketing tag */}
      <View style={styles.header}>
        <View style={styles.propertyInfo}>
          <Image
            source={iconSource}
            style={styles.propertyIcon}
            resizeMode="cover"
          />
          <Text style={styles.propertyName} numberOfLines={1}>
            {propertyName}
          </Text>
        </View>
        {marketingTag ? (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText} numberOfLines={1}>
              {marketingTag}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Description */}
      {description ? (
        hasHtml ? (
          <View style={styles.htmlContainer}>
            <HtmlDescription html={description} />
          </View>
        ) : (
          <Text style={styles.description} numberOfLines={4}>
            {description}
          </Text>
        )
      ) : null}

      {/* Post image */}
      {image ? (
        <Image
          source={{uri: image}}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  propertyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
  },
  propertyName: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 14,
    color: Colors.textDark,
    marginLeft: 10,
    flex: 1,
  },
  tagContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: Fonts.poppinsSemiBold,
    fontSize: 10,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  htmlContainer: {
    marginBottom: 10,
    minHeight: 30,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 19,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
});

export default PromotionCard;
