import React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';

import { AppProvider, useApp } from './src/state/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

// Safer web check to prevent Android crashes related to 'document'
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide scrollbar for Chrome, Safari and Opera */
    ::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    * {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
  `;
  document.head.append(style);
}

// Your frame image
const frameImage = require('./assets/frame.png');

function NavRoot() {
  const { colors, isDark } = useApp();
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

// 1. The layout component that reads the theme
function AppLayout() {
  const { isDark } = useApp();

  // EARLY RETURN FOR MOBILE: This makes the native build truly untouched.
  if (Platform.OS !== 'web') {
    return (
      <SafeAreaProvider>
        <NavRoot />
      </SafeAreaProvider>
    );
  }

  // WEB ONLY: Everything below this line will only ever execute on the web.
  const desktopBackgroundColor = isDark ? '#0e0e11' : '#f3f4f6';

  return (
    <View style={[styles.webWrapper, { backgroundColor: desktopBackgroundColor }]}>
      <View style={styles.deviceContainer}>
        
        {/* LAYER 1 (BOTTOM): The Actual App */}
        <View style={styles.appScreen}>
          <SafeAreaProvider>
            <NavRoot />
          </SafeAreaProvider>
        </View>

        {/* LAYER 2 (TOP): The Hardware Frame Overlay */}
        <Image 
          source={frameImage}
          style={styles.hardwareFrame}
          pointerEvents="none" 
        />

      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      {/* 2. AppProvider wraps everything so AppLayout can access the theme */}
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    ...(Platform.OS === 'web' && { userSelect: 'none' }),
  },
  webWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    paddingVertical: Platform.OS === 'web' ? 40 : 0, 
  },
  
  // The bounding box for the whole phone
  deviceContainer: {
    width: 540,
    height: 820,
    position: 'relative',   
  },
  
  // LAYER 1: App Screen setup (Kept your exact custom dimensions!)
  appScreen: {
    position: 'absolute',
    top: 80,
    bottom: 80,
    left: 110,
    right: 110,
    paddingTop: 25,
    borderRadius: 35, 
    overflow: 'hidden',
    zIndex: 1,
  },
  
  // LAYER 2: Image Overlay setup
  hardwareFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'stretch', 
    zIndex: 10, 
  },
});