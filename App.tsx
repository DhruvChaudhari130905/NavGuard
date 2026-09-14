import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationProvider } from './src/context/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar style="dark" />
          <View style={styles.root}>
            <AppNavigator />
          </View>
        </SafeAreaView>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
