import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { Transaction } from '../../types/transaction';
import { useDispatch, useSelector } from 'react-redux';
import { Account } from '@/types/account';
import { fetchAccounts } from '../../actions/accountActions';
import { fetchTransactions } from '../api/bankApi';

interface TransactionListProps {
  accountId?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ accountId }) => {
  const { accounts, loading: accountsLoading, error: accountsError } = useSelector((state: any) => state.accounts || {});
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Add loading state


  useEffect(() => {
    const fetchData = async () => {
      if (accountId) {
        const newTransactions = await fetchTransactions(50, page, accountId);
        setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
      } else {
        const newTransactions = await fetchTransactions(50, page);
        setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
      }
      setIsLoadingMore(false); // Reset loading state after fetching
    };

    fetchData();
  }, []);


  console.log(accountId);

  const loadMoreTransactions = () => {
    if (!isLoadingMore) { // Prevent multiple calls
      setIsLoadingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (accountId) {
        const newTransactions = await fetchTransactions(50, page, accountId);
        setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
      } else {
        const newTransactions = await fetchTransactions(50, page);
        setTransactions(prevTransactions => [...prevTransactions, ...newTransactions]);
      }
      setIsLoadingMore(false); // Reset loading state after fetching
    };

    fetchData();
  }, [page, accountId]);

  const filteredTransactions = useMemo(() => {
    if (accountId) {
      return transactions.filter(transaction => transaction.from_account_id === accountId || transaction.to_account_id === accountId);
    }
    return transactions;
  }, [transactions, accountId]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    (filteredTransactions || []).forEach(transaction => {
      if (!groups[transaction.date]) {
        groups[transaction.date] = [];
      }
      groups[transaction.date].push(transaction);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredTransactions]);

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
  };

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
          if (transaction.from_account_id === accountId) {
            return total - transaction.amount;
          } else if (transaction.to_account_id === accountId) {
            return total + transaction.amount;
          }
        }
      }
      return total;
    }, 0);
  };

  const accountNameFromId = (accountId: number) => {
    if (!accounts || !Array.isArray(accounts)) {
      return accountId.toString();
    }
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : accountId.toString();
  };

  const handlePress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails', { transaction });
  };

  if (accountsLoading) {
    return <Text>Loading accounts...</Text>;
  }

  if (accountsError) {
    return <Text>Error loading accounts: {accountsError instanceof Error ? accountsError.message : String(accountsError)}</Text>;
  }

  // Footer component for loading indicator
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  return (
    <FlatList
      data={groupedTransactions}
      keyExtractor={([date]) => date}
      style={{ flex: 1, paddingBottom: 150 }}
      renderItem={({ item: [date, transactions] }) => {
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
                <Pressable
                  key={`${item.id}-${date}`}
                  onPress={() => handlePress(item)}
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
                        {accountNameFromId(item.from_account_id)} → {accountNameFromId(item.to_account_id)}
                      </Text>
                    )}
                    {item.type === 'expense' && (
                      <Text style={styles.expenseDetails}>{accountNameFromId(item.from_account_id)}</Text>
                    )}
                    {item.type === 'income' && (
                      <Text style={styles.incomeDetails}>{accountNameFromId(item.to_account_id)}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    item.type === 'expense' ? styles.expense :
                      item.type === 'income' ? styles.income : styles.transfer
                  ]}>
                    {formatAmount(item.amount, item.type)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      }}
      onEndReached={loadMoreTransactions} // Load more transactions when reaching the end
      onEndReachedThreshold={0.5} // Adjust threshold to prevent premature triggering
      contentContainerStyle={styles.contentTransactionList}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({

  contentTransactionList: {
    flexGrow: 1,
  },
  footer: {
    padding: 10,
    alignItems: 'center',
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
  transactionDetails: {
    flex: 1,
  },
  transferDetails: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '300',
  },
  expenseDetails: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '300',
  },
  incomeDetails: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '300',
  },
});

export default TransactionList;