import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Screens } from '../constants/Constants';
import { checkAuth } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth, user } = useSelector(
    state => state.auth,
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isCheckingAuth) return;

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.is_profile_complete) {
          navigation.replace(Screens.MainApp);
        } else {
          navigation.replace(Screens.Onboarding1);
        }
      } else {
        navigation.replace(Screens.Welcome);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCheckingAuth, isAuthenticated, user, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: 100,
  },
});

export default SplashScreen;
