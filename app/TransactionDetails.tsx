import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Button, Icon, Card, Text, Divider } from 'react-native-elements';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../types/navigation';
import { Transaction } from '../types/transaction';
import { useDispatch, useSelector } from 'react-redux';
import { Account } from '@/types/account';
import { colors } from '@/constants/colors';
import { BackButton } from '@/app/components/BackButton';
import { fetchTransactions } from '@/actions/transactionActions';
import { deleteTransaction } from './api/bankApi';
import sharedStyles from './styles/sharedStyles';
import { Menu } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

const formatAmount = (amount: number, type: string) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

const accountNameFromId = (accountId: number, accounts: Account[] | undefined) => {
  if (!accounts || !Array.isArray(accounts)) {
    return accountId.toString();
  }
  const account = accounts.find(a => a.id === accountId);
  return account ? account.name : accountId.toString();
};

export default function TransactionDetailsScreen() {
  const route = useRoute<TransactionDetailsRouteProp>();
  const navigation = useNavigation();
  const transaction = route.params?.transaction as Transaction; // Ensure transaction is correctly typed
  console.log('route.params in TransactionDetailsScreen : ', route.params);
  const dispatch = useDispatch();
  const { accounts, error: accountsError } = useSelector((state: any) => state.accounts || {});

  const [NewTransaction, setNewTransaction] = useState(transaction);


  const handleEdit = () => { // Change parameter type to Transaction
    // Navigate to the edit screen or open a modal
    console.log('transaction in handleEdit : ', transaction);
    navigation.navigate('AddTransaction', { transaction: transaction }); // Pass the entire transaction object
    closeMenu();
  };

  if (accountsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading accounts: {accountsError instanceof Error ? accountsError.message : String(accountsError)}</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Transaction details not available.</Text>
      </View>
    );
  }

  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleDeleteTransaction = async () => {
    try {
      Alert.alert('Are you sure you want to delete this transaction?', '', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            dispatch(fetchTransactions());
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={sharedStyles.header}>
        <BackButton />
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<Pressable style={styles.menuButton} onPress={openMenu}><Ionicons name="ellipsis-vertical" size={24} /></Pressable>}
          >
            <Menu.Item onPress={handleEdit} title="Edit Transaction" />
            <Menu.Item onPress={handleDeleteTransaction} title="Delete Transaction" />
          </Menu>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(transaction.type) }]}>
              <Icon
                name={getIconName(transaction.type)}
                type="font-awesome"
                color="white"
                size={30}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{transaction.description}</Text>
              <Text style={styles.date}>{format(parseISO(transaction.date), 'dd MMMM yyyy')}</Text>
            </View>
          </View>
          <Text style={[styles.amount, { color: getAmountColor(transaction.type) }]}>
            {formatAmount(transaction.amount, transaction.type)}
          </Text>

          <View style={styles.categoryContainer}>
            <Icon name="tag" type="font-awesome" color="#517fa4" size={18} />
            <Text style={styles.category}>{transaction.category} {transaction.subcategory && (transaction.type !== 'income' && transaction.type !== 'transfer') ? ` - ${transaction.subcategory}` : ''}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            <DetailRow icon="exchange" label="Type" value={capitalizeFirstLetter(transaction.type)} />
            <Pressable onPress={() => navigation.navigate('TransactionsScreenAccount', { account: accounts.find(account => account.id === transaction.from_account_id) })}>
              <DetailRow icon="arrow-right" label="From" value={accountNameFromId(transaction.from_account_id, accounts)} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('TransactionsScreenAccount', { account: accounts.find(account => account.id === transaction.to_account_id) })}>
              <DetailRow icon="arrow-left" label="To" value={accountNameFromId(transaction.to_account_id, accounts)} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} type="font-awesome" color="#517fa4" size={18} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const getIconName = (type: string) => {
  switch (type) {
    case 'income':
      return 'arrow-down';
    case 'expense':
      return 'arrow-up';
    default:
      return 'exchange';
  }
};

const getIconBackgroundColor = (type: string) => {
  switch (type) {
    case 'income':
      return '#4CAF50';
    case 'expense':
      return '#F44336';
    default:
      return '#2196F3';
  }
};

const getAmountColor = (type: string) => {
  switch (type) {
    case 'income':
      return '#4CAF50';
    case 'expense':
      return '#F44336';
    default:
      return '#2196F3';
  }
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  menuButton: {
    marginRight: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    borderRadius: 30,
    padding: 15,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  category: {
    fontSize: 18,
    color: '#517fa4',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
    marginLeft: 10,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
});