/**
 * CIPHER — app entry. Loads fonts, hydrates the Artist Decoder cache,
 * mounts navigation. Dark theme only.
 */
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import Navigation from './src/navigation/index.js';
import { useDecoderStore } from './src/store/useDecoderStore.js';
import { useFeedbackStore } from './src/store/useFeedbackStore.js';
import { loadDynamicRules } from './src/services/feedbackService.js';
import { colors } from './src/theme/index.js';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const loadDecoder = useDecoderStore((s) => s.load);
  useEffect(() => {
    // Fetch + cache the Artist Decoder DB (24h TTL, offline fallback).
    loadDecoder();
    // Learning System: install confirmed dynamic kill-list rules and retry
    // any feedback submissions that failed offline.
    loadDynamicRules();
    useFeedbackStore.getState().flush();
  }, [loadDecoder]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.body, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.body} />
      <Navigation />
    </SafeAreaProvider>
  );
}
