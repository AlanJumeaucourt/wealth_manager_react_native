import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import store from '../store'; // Ensure the correct path to your store
import AccountsScreen from './AccountsScreen';
import TransactionsScreen from './TransactionsScreen';
import InvestmentScreen from './InvestmentScreen';
import BudgetScreen from './BudgetScreen';
import WealthDashboard from './WealthScreen';
import AddAccountScreen from './AddAccountScreen';
import AddTransactionScreen from './AddTransactionScreen';
import AccountList from '../components/AccountList';
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Provider store={store}>
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
        <Tab.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={{
            tabBarLabel: 'Add Account',
            tabBarIcon: ({ color, size }) => (
              <Icon name="plus" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </Provider>
  );
}
