import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from './components/TransactionList'; // Import the TransactionList component

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

interface Account {
  id: string;
  name: string;
  balance: number;
  bank: string;
  type: string;
}

type RouteParams = {
  account: Account;
};

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { account } = route.params as RouteParams;

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <Text style={styles.accountName}>{account.name}</Text>
      <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>

      <TransactionList transactions={mockTransactions} accountId={account.id} />
    </View>
  );
}

const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f5f5f5',
  text: '#2c3e50',
  lightText: '#7f8c8d',
  white: '#ffffff',
  lightGray: '#ecf0f1',
  darkGray: '#bdc3c7',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  accountInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 5,
  },
  accountItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  accountName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountBalance: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 20,
  },
  transactionList: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positiveTotal: {
    color: '#4CAF50',
  },
  negativeTotal: {
    color: '#000000',
  },
  transactionsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  firstTransaction: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastTransaction: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 0,
  },
  transactionDescription: {
    fontSize: 16,
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  expense: {
    color: '#000000',
    fontWeight: 'normal',
  },
  income: {
    color: '#4CAF50',
    fontWeight: 'normal',
  },
  transfer: {
    color: '#2196F3',
    fontWeight: 'normal',
  },
});
