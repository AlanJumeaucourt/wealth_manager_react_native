import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Button, SafeAreaView } from 'react-native';
import { Provider as PaperProvider, TextInput, Button as PaperButton, BottomNavigation } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonActions } from '@react-navigation/native';

import AccountsScreen from './AccountsScreen';
import TransactionsScreen from './TransactionsScreen';
import InvestmentScreen from './investment';
import BudgetScreen from './budgetScreen';
import WealthDashboard from './wealthDashboard';

const Tab = createBottomTabNavigator();

export default function MyComponent() {
  return (
    <Tab.Navigator
      initialRouteName="Accounts"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.title;

            return label;
          }}
        />
      )}
    >
      <Tab.Screen
        name="Home"
        component={AccountsScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="home" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="finance" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="file-document-outline" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Investment"
        component={InvestmentScreen}
        options={{
          tabBarLabel: 'Investment',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="chart-bar" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Wealth"
        component={WealthDashboard}
        options={{
          tabBarLabel: 'Wealth',
          tabBarIcon: ({ color, size }) => {
            return <Icon name="chart-bar" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}
