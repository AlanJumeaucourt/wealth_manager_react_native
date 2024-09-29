import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

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

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof mockTransactions> = {};
    mockTransactions.forEach(transaction => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, []);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d MMMM yyyy");
  };

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
  };

  const calculateDayTotal = (transactions: typeof mockTransactions) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'expense') return total - transaction.amount;
      if (transaction.type === 'income') return total + transaction.amount;
      if (transaction.type === 'transfer') {
        if (transaction.fromAccountId === account.id) {
          return total - transaction.amount;
        } else if (transaction.toAccountId === account.id) {
          return total + transaction.amount;
        }
      }
      return total;
    }, 0);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.accountName}>{account.name}</Text>
      <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>

      <ScrollView style={styles.transactionList}>
        {groupedTransactions.map(([date, transactions]) => {
          const dayTotal = calculateDayTotal(transactions);
          return (
            <View key={date} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateHeaderText}>{formatDate(date)}</Text>
                <Text style={[styles.dayTotal, dayTotal >= 0 ? styles.positiveTotal : styles.negativeTotal]}>
                  {formatAmount(Math.abs(dayTotal), dayTotal >= 0 ? 'income' : 'expense')}
                </Text>
              </View>
              <View style={styles.transactionsContainer}>
                {transactions.map((item, index) => (
                  <View 
                    key={item.id} 
                    style={[
                      styles.transactionItem,
                      index === 0 && styles.firstTransaction,
                      index === transactions.length - 1 && styles.lastTransaction,
                    ]}
                  >
                    <Text style={styles.transactionDescription}>{item.description}</Text>
                    <Text style={[
                      styles.transactionAmount,
                      item.type === 'expense' ? styles.expense : 
                      item.type === 'income' ? styles.income : styles.transfer
                    ]}>
                      {formatAmount(item.amount, item.type)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 5,
  },
  accountName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
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
