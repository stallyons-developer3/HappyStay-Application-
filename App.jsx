import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Constants';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Colors.primary);
      StatusBar.setBarStyle('light-content');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
