import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import store from '../store';
import AccountsScreen from './AccountsScreen';
import TransactionsScreen from './TransactionsScreen';
import InvestmentScreen from './InvestmentScreen';
import BudgetScreen from './BudgetScreen';
import WealthDashboard from './WealthScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import SafeViewAndroid from './components/SafeViewAndroid';
import { colors } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import { PaperProvider, Button } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AddAccountScreen from './AddAccountScreen';
import AddTransactionScreen from './AddTransactionScreen';
import TransactionsScreenAccount from './TransactionsScreenAccount';
import TransactionDetails from './TransactionDetails';
import { View, Text } from "react-native";
import * as Sentry from "@sentry/react-native";
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginScreen from './(auth)/login';
import RegisterScreen from './(auth)/register';

Sentry.init({
  dsn: "https://d12d7aa6d6edf166709997c29591227d@o4508077260996608.ingest.de.sentry.io/4508077266239568",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
});
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function AccountsScreenNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="AddAccount" component={AddAccountScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="TransactionsScreenAccount" component={TransactionsScreenAccount} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetails} />
    </Stack.Navigator>
  );
}

function TransactionsScreenNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetails} />
    </Stack.Navigator>
  );
}

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  return (
    <NavigationContainer independent={true}>
    <Tab.Navigator
      initialRouteName="Accounts"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Accounts"
        component={AccountsScreenNavigator}
        options={{
          tabBarLabel: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreenNavigator}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Investment"
        component={InvestmentScreen}
        options={{
          tabBarLabel: 'Investment',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <Icon name="finance" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Wealth"
        component={WealthDashboard}
        options={{
          tabBarLabel: 'Wealth',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    </NavigationContainer>
  );
}

function AppNavigator() {  
  return (
    <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider>
            <SafeAreaView style={[styles.container, SafeViewAndroid.AndroidSafeArea, { backgroundColor: colors.background }]}>
            <AuthProvider>
              </AuthProvider>
            </SafeAreaView>
          </PaperProvider>
        </GestureHandlerRootView>
    </Provider>
  );
}

const SentryTest = () => {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <SafeAreaView style={[styles.container, SafeViewAndroid.AndroidSafeArea, { backgroundColor: colors.background }]}>
            <View>
              <Button style={{ backgroundColor: 'red' }} title='Try!' onPress={() => { Sentry.captureException(new Error('First error')) }} />
            </View>
          </SafeAreaView>
        </PaperProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}

export default Sentry.wrap(AppNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

