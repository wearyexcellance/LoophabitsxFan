import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { HabitsProvider } from './src/context/HabitsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <HabitsProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </HabitsProvider>
  );
}
