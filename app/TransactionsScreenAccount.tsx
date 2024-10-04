import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from './components/TransactionList'; // Import the TransactionList component
import { Account } from '@/types/account';
import { colors } from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '@/actions/transactionActions';
import { BackButton } from './components/BackButton';
import { DeleteButton } from './components/DeleteButton';
import { deleteAccount } from './api/bankApi';
import { fetchAccounts } from '@/actions/accountActions';
type RouteParams = {
  account: Account;
  refreshAccounts: () => void;
};

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector((state: any) => state.transactions);
  const navigation = useNavigation();
  const route = useRoute();
  const { account, refreshAccounts } = route.params as RouteParams;

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(account.id);
      dispatch(fetchAccounts());
      refreshAccounts(); // Appel de la fonction de rafraîchissement
      navigation.goBack(); // Retour à l'écran des comptes
    } catch (error) {
      console.error('Error deleting account:', error);
      // Gérer l'erreur (par exemple, afficher un message à l'utilisateur)
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <BackButton />
        <DeleteButton
          deleteText="Delete Account"
          deleteTextAlert="Are you sure you want to delete this account?"
          deleteFunction={handleDeleteAccount}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>
        </View>
        <ScrollView>

          <View style={styles.container}>

            <TransactionList transactions={transactions} accountId={account.id} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  body: {
    paddingHorizontal: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 5,
  },
  accountItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
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
