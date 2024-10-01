import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './index';
import BudgetScreen from './BudgetScreen';
import TransactionsScreen from './TransactionsScreenAccount';
import InvestmentScreen from './InvestmentScreen';
import WealthDashboardScreen from './WealthScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Budget') {
            iconName = 'wallet';
          } else if (route.name === 'Transactions') {
            iconName = 'list';
          } else if (route.name === 'Investment') {
            iconName = 'trending-up';
          } else if (route.name === 'WealthDashboard') {
            iconName = 'stats-chart';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#3498db',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Investment" component={InvestmentScreen} />
      <Tab.Screen name="WealthDashboard" component={WealthDashboardScreen} />
    </Tab.Navigator>
  );
}