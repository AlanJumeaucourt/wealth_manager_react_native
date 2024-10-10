import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from './components/TransactionList'; // Import the TransactionList component
import { Account } from '@/types/account';
import { colors } from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions as fetchTransactionsApi } from '@/app/api/bankApi';
import { BackButton } from './components/BackButton';
import { DeleteButton } from './components/DeleteButton';
import { deleteAccount } from './api/bankApi';
import { fetchAccounts } from '@/actions/accountActions';
import sharedStyles from './styles/sharedStyles';
import { Button } from 'react-native-paper';
import { useCallback } from 'react';
import { Menu, Provider } from 'react-native-paper';

type RouteParams = {
  account: Account;
  refreshAccounts: () => void;
};

export default function TransactionsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { account, refreshAccounts } = route.params as RouteParams;
  console.log('route.params : ', route.params);

  const [visible, setVisible] = useState(false); // State to manage menu visibility

  const openMenu = () => setVisible(true); // Function to open the menu
  const closeMenu = () => setVisible(false); // Function to close the menu

  const handleEditAccount = () => {
    navigation.navigate('AddAccount', { account });
    closeMenu();
  };

  const handleDeleteAccount = async () => {
    try {
      Alert.alert('Are you sure you want to delete this account?', '', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteAccount(account.id);
            dispatch(fetchAccounts());
            refreshAccounts();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <Provider>
      <View style={styles.mainContainer}>
        <View style={sharedStyles.header}>
          <BackButton />
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<Pressable style={styles.menuButton} onPress={openMenu}><Ionicons name="ellipsis-vertical" size={24} /></Pressable>}
          >
            <Menu.Item onPress={handleEditAccount} title="Edit Account" />
            <Menu.Item onPress={handleDeleteAccount} title="Delete Account" />
          </Menu>
        </View>
        <View style={sharedStyles.body}>
          <View style={styles.accountHeader}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>
          </View>
          <TransactionList accountId={account.id} />
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    marginRight: 16,
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
});
