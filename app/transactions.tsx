import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Modal } from 'react-native';
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

export type TransactionType = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  fromAccountId: string;
  toAccountId: string;
};
    
type RouteParams = {
  account: Account;
};

type RootStackParamList = {
  TransactionDetails: { transaction: TransactionType };
};

type TransactionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionDetails'>;

// New component for Transaction Detail Modal
type TransactionDetailModalProps = {
  transaction: TransactionType | null;
  isVisible: boolean;
  onClose: () => void;
};

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, isVisible, onClose }) => {
  if (!transaction) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Transaction Details</Text>
          <Text style={styles.modalDetail}>Date: {format(parseISO(transaction.date), 'dd MMM yyyy')}</Text>
          <Text style={styles.modalDetail}>Description: {transaction.description}</Text>
          <Text style={styles.modalDetail}>Amount: {formatAmount(transaction.amount, transaction.type)}</Text>
          <Text style={styles.modalDetail}>Type: {transaction.type}</Text>
          {transaction.type === 'transfer' ? (
            <>
              <Text style={styles.modalDetail}>From Account: {transaction.fromAccountId}</Text>
              <Text style={styles.modalDetail}>To Account: {transaction.toAccountId}</Text>
            </>
          ) : (
            <Text style={styles.modalDetail}>
              {transaction.type === 'expense' ? 'From' : 'To'} Account: {transaction.type === 'expense' ? transaction.fromAccountId : transaction.toAccountId}
            </Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TransactionsScreen() {
  const navigation = useNavigation<TransactionsScreenNavigationProp>();

  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      // For transfers, we don't change the total as it's just moving money between accounts
      return total;
    }, 0);
  };

  const handleTransactionPress = (transaction: TransactionType) => {
    navigation.navigate('TransactionDetails', { transaction });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Transactions</Text>

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
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.transactionItem,
                      index === 0 && styles.firstTransaction,
                      index === transactions.length - 1 && styles.lastTransaction,
                    ]}
                    onPress={() => handleTransactionPress(item)}
                  >
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>{item.description}</Text>
                      <Text style={styles.accountInfo}>
                        {item.type === 'transfer' 
                          ? `Transfer: Account ${item.fromAccountId} → Account ${item.toAccountId}`
                          : `Account ${item.type === 'expense' ? item.fromAccountId : item.toAccountId}`
                        }
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      item.type === 'expense' ? styles.expense : 
                      item.type === 'income' ? styles.income : styles.transfer
                    ]}>
                      {formatAmount(item.amount, item.type)}
                    </Text>
                  </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalDetail: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
