import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from './components/TransactionList';
import { Transaction } from '../types/transaction';
import { mockTransactions } from './api/mockApi';

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