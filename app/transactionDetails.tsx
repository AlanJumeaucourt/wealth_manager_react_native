import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { TransactionType } from '@/app/transactions'

type RootStackParamList = {
  TransactionDetails: { transaction: TransactionType };
};

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

type Props = {
  route: TransactionDetailsRouteProp;
};

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

export default function TransactionDetailsScreen({ route }: Props) {
  const { transaction } = route.params;

  return (
    <ScrollView style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
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
});