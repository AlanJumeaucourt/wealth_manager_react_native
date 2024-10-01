import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { formatAmount } from './CommonTransactionComponents';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  fromAccountId: string;
  toAccountId: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  accountId: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, accountId }) => {
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach(transaction => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [transactions]);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d MMMM yyyy");
  };

  const calculateDayTotal = (transactions: Transaction[]) => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'expense') return total - transaction.amount;
      if (transaction.type === 'income') return total + transaction.amount;
      if (transaction.type === 'transfer') {
        if (accountId) {
          if (transaction.fromAccountId === accountId) {
            return total - transaction.amount;
          } else if (transaction.toAccountId === accountId) {
            return total + transaction.amount;
          }
        }
      }
      return total;
    }, 0);
  };

  return (
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
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>{item.description}</Text>
                    {item.type === 'transfer' && (
                      <Text style={styles.transferDetails}>
                        Transfer: {item.fromAccountId} → {item.toAccountId}
                      </Text>
                    )}
                  </View>
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
  );
};

const styles = StyleSheet.create({
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

export default TransactionList;