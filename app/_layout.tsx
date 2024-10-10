import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { setupAxiosInterceptors, setAuthToken } from '@/utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import InvestmentScreen from './InvestmentScreen';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://d12d7aa6d6edf166709997c29591227d@o4508077260996608.ingest.de.sentry.io/4508077266239568',
  _experiments: {
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },
  integrations: [
    Sentry.mobileReplayIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

Sentry.mobileReplayIntegration({
  maskAllText: true,
  maskAllImages: true,
  maskAllVectors: true,
});


const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#2c3e50',
    border: '#ecf0f1',
  },
};

function useProtectedRoute(isLoggedIn: boolean | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/login");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/");
    }
  }, [isLoggedIn, segments, router]);
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter(); // Get the router instance

  useEffect(() => {
    setupAxiosInterceptors(router); // Pass the router to the interceptor setup
    AsyncStorage.getItem('accessToken').then(token => {
      if (token) {
        setAuthToken(token);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  useProtectedRoute(isLoggedIn);

  if (isLoggedIn === null) {
    return <Slot />;
  }

  return (
    <ThemeProvider value={theme}>
      {isLoggedIn ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Slot />
        </Stack>
      ) : (
        <Slot />
      )}
    </ThemeProvider>
  );
}
