import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TransactionList from './components/TransactionList';
import { fetchTransactions } from '../actions/transactionActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store'; // Assuming you have a root state type defined

const TransactionContent = ({
  transactions,
  transactionsLoading,
  transactionsError
}: {
  transactions: any[],
  transactionsLoading: boolean,
  transactionsError: string | null
}) => {
  if (transactionsLoading) {
    return <Text>Loading...</Text>;
  }

  if (transactionsError) {
    return <Text>Error: {transactionsError}</Text>;
  }

  return (
    <>
      <Text style={styles.screenTitle}>All Transactions</Text>
      {transactions && <TransactionList transactions={transactions} accountId="" />}
    </>
  );
};

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const { transactions, transactionsLoading, transactionsError } = useSelector((state: RootState) => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <TransactionContent
        transactions={transactions}
        transactionsLoading={transactionsLoading}
        transactionsError={transactionsError}
      />
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
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});