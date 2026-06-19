import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { useApp } from '../state/AppContext';
import DrawerContent from './DrawerContent';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// App
import CalendarScreen from '../screens/CalendarScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import StreaksScreen from '../screens/StreaksScreen';
import FocusScreen from '../screens/FocusScreen';
import RoutinesScreen from '../screens/RoutinesScreen';
import RoutineDetailsScreen from '../screens/RoutineDetailsScreen';
import AddRoutineScreen from '../screens/AddRoutineScreen';
import PuzzleScreen from '../screens/PuzzleScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const HomeStack = createNativeStackNavigator();
const RoutineStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Calendar" component={CalendarScreen} />
      <HomeStack.Screen name="AddTask" component={AddTaskScreen} />
      <HomeStack.Screen name="Streaks" component={StreaksScreen} />
    </HomeStack.Navigator>
  );
}

function RoutinesNavigator() {
  return (
    <RoutineStack.Navigator screenOptions={{ headerShown: false }}>
      <RoutineStack.Screen name="RoutinesList" component={RoutinesScreen} />
      <RoutineStack.Screen name="RoutineDetails" component={RoutineDetailsScreen} />
      <RoutineStack.Screen name="AddRoutine" component={AddRoutineScreen} />
      <RoutineStack.Screen name="Puzzle" component={PuzzleScreen} />
      <RoutineStack.Screen name="Streaks" component={StreaksScreen} />
    </RoutineStack.Navigator>
  );
}

function AppDrawer() {
  const { state } = useApp();
  const lang = state.prefs?.language === 'Türkçe' ? 'Türkçe' : 'English';
  
  // Translation map for drawer screen titles
  const t = {
    English: { Home: 'Home', Focus: 'Focus', Routines: 'Routines', Analytics: 'Analytics', Premium: 'Premium', Settings: 'Settings', Help: 'Help' },
    Türkçe: { Home: 'Ana Sayfa', Focus: 'Odak', Routines: 'Rutinler', Analytics: 'Analizler', Premium: 'Premium', Settings: 'Ayarlar', Help: 'Yardım' }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'front', swipeEdgeWidth: 60 }}
    >
      <Drawer.Screen name="Home" component={HomeNavigator} options={{ title: t[lang].Home }} />
      <Drawer.Screen name="Focus" component={FocusScreen} options={{ title: t[lang].Focus }} />
      <Drawer.Screen name="Routines" component={RoutinesNavigator} options={{ title: t[lang].Routines }} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} options={{ title: t[lang].Analytics }} />
      <Drawer.Screen name="Premium" component={PremiumScreen} options={{ title: t[lang].Premium }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: t[lang].Settings }} />
      <Drawer.Screen name="Help" component={HelpScreen} options={{ title: t[lang].Help }} />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { state } = useApp();

  if (!state.hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {state.user ? (
        <RootStack.Screen name="App" component={AppDrawer} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}