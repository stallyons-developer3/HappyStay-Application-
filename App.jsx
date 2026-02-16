import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Constants';
import { getPusher } from './src/services/pusherService';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Colors.primary);
      StatusBar.setBarStyle('dark-content');
    }
    getPusher();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
