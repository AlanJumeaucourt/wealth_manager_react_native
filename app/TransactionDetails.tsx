import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../App'; // Adjust the import path as needed

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

export default function TransactionDetailsScreen() {
  const route = useRoute<TransactionDetailsRouteProp>();
  const transaction = route.params?.transaction;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Transaction details not available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Transaction Details</Text>
          <Text style={styles.detail}>Date: {format(parseISO(transaction.date), 'dd MMM yyyy')}</Text>
          <Text style={styles.detail}>Description: {transaction.description}</Text>
          <Text style={styles.detail}>Amount: {formatAmount(transaction.amount, transaction.type)}</Text>
          <Text style={styles.detail}>Type: {transaction.type}</Text>
          {transaction.type === 'transfer' ? (
            <>
              <Text style={styles.detail}>From Account: {transaction.fromAccountId}</Text>
              <Text style={styles.detail}>To Account: {transaction.toAccountId}</Text>
            </>
          ) : (
            <Text style={styles.detail}>
              {transaction.type === 'expense' ? 'From' : 'To'} Account: {transaction.type === 'expense' ? transaction.fromAccountId : transaction.toAccountId}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});