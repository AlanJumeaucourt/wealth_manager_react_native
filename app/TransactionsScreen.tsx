import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TransactionList from './components/TransactionList';
import { fetchTransactions } from '../actions/transactionActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store'; // Assuming you have a root state type defined
import { darkTheme } from '../constants/theme';
import { ActivityIndicator } from 'react-native-paper';
import sharedStyles from './styles/sharedStyles';

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  if (transactionsError) {
    return <Text style={styles.errorText}>Error: {transactionsError}</Text>;
  }

  return (
    <View style={[sharedStyles.body, { paddingTop: darkTheme.spacing.m }]}>
      {transactions && <TransactionList transactions={transactions} accountId="" />}
    </View>
  );
};

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const { transactions, transactionsLoading, transactionsError } = useSelector((state: RootState) => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  return (
    <View style={[sharedStyles.container]}>
      <View style={sharedStyles.header}>
        <Text style={sharedStyles.headerTitle}>All Transactions</Text>
      </View>
      <View style={sharedStyles.body}>
        <TransactionContent
          transactions={transactions}
          transactionsLoading={transactionsLoading}
          transactionsError={transactionsError}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: darkTheme.spacing.m,
    color: darkTheme.colors.text,
  },
  errorText: {
    color: darkTheme.colors.error,
    textAlign: 'center',
    marginTop: darkTheme.spacing.l,
  },
});
