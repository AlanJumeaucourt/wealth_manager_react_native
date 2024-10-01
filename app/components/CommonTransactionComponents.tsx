import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

export const formatAmount = (amount: number, type: string) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

export const TransactionDetails = ({ transaction }: { transaction: any }) => {
  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction details not available.</Text>
      </View>
    );
  }

  return (
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
  );
};

const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
});