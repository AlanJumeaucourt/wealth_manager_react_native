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
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppNavigator() {


  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PaperProvider>
          <SafeAreaView style={[styles.container, SafeViewAndroid.AndroidSafeArea, { backgroundColor: colors.background }]}>

            <NavigationContainer independent={true}>
              <Tab.Navigator
                initialRouteName="Accounts"
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Tab.Screen
                  name="Accounts"
                  component={AccountsScreen}
                  options={{
                    tabBarLabel: 'Accounts',
                    tabBarIcon: ({ color, size }) => (
                      <Icon name="account" size={size} color={color} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Transactions"
                  component={TransactionsScreen}
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
          </SafeAreaView>
        </PaperProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

