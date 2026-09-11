import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './app/LoginScreen';
import PatientHomeScreen from './app/patient/PatientHomeScreen';
import GameScreen from './app/patient/GameScreen';
import RemindersScreen from './app/patient/RemindersScreen';
import CaregiverHomeScreen from './app/caregiver/CaregiverHomeScreen';
import AnalysisScreen from './app/caregiver/AnalysisScreen';
import { COLORS } from './utils/theme';
import IDCardScreen from './app/patient/IDCardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
          options={{
            title: 'Smriti 🧠',
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'Memory Game 🧩' }}
        />

        <Stack.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{ title: 'Reminders 🔔' }}
        />

        {/* ID CARD */}
        <Stack.Screen
          name="IDCard"
          component={IDCardScreen}
          options={{ title: 'My ID Card 🪪' }}
        />

        <Stack.Screen
          name="CaregiverHome"
          component={CaregiverHomeScreen}
          options={{
            title: 'Smriti — Caregiver 👩‍⚕️',
            headerLeft: () => null,
          }}
        />

        <Stack.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{ title: 'Patient Analysis 📊' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
