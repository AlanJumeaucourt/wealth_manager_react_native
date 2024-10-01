import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from './components/TransactionList';

// Mock transaction data
const mockTransactions = [
  { id: '1', date: '2023-03-15', description: 'Grocery Store', amount: 75.50, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '2', date: '2023-03-15', description: 'Gas Station', amount: 50.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '3', date: '2023-03-14', description: 'Salary', amount: 2500.00, type: 'income', fromAccountId: '2', toAccountId: '1' },
  { id: '4', date: '2023-03-13', description: 'Restaurant', amount: 45.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '5', date: '2023-03-13', description: 'Coffee', amount: 5.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '6', date: '2023-03-12', description: 'Dinner', amount: 100.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '7', date: '2023-03-12', description: 'Groceries', amount: 150.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '8', date: '2023-03-12', description: 'Gas', amount: 30.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  { id: '9', date: '2023-03-12', description: 'Transfer', amount: 1000.00, type: 'transfer', fromAccountId: '1', toAccountId: '2' },
  { id: '10', date: '2023-03-11', description: 'Transfer', amount: 2000.00, type: 'transfer', fromAccountId: '2', toAccountId: '1' },
  { id: '11', date: '2023-03-11', description: 'Coffee', amount: 5.00, type: 'expense', fromAccountId: '1', toAccountId: '2' },
  // Add more mock transactions as needed
];

export default function TransactionsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Removed the back button */}
      <Text style={styles.screenTitle}>All Transactions</Text>

      <TransactionList transactions={mockTransactions} accountId="" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  // Removed backButton and backButtonText styles
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});