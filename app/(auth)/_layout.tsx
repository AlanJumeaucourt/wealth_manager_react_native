import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';

export default function AuthLayout() {
  return <AuthProvider><Stack>
    <Stack.Screen name="login" options={{ headerShown: false }} />
    <Stack.Screen name="register" options={{ headerShown: false }} />
  </Stack></AuthProvider>;
}
