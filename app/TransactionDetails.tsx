import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Alert, Pressable } from 'react-native';
import { Button, Icon, Card, Text, Divider } from 'react-native-elements';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { RootStackParamList } from '../types/navigation';
import { Transaction } from '../types/transaction';
import { accounts } from '../data/accounts';
import { mockAccounts } from './api/mockApi';

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

const formatAmount = (amount: number, type: Transaction) => {
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'expense' ? `-${formattedAmount} €` : `${formattedAmount} €`;
};

const accountNameFromId = (accountId: number) => {
  const account = mockAccounts.find(a => a.id === accountId);
  return account ? account.name : accountId.toString();
};

const handleEdit = (transactionId: string) => {
  // Navigate to the edit screen or open a modal
  Alert.alert('Edit', `Edit transaction with ID: ${transactionId}`);
};

const handleDelete = (transactionId: string) => {
  // Confirm and delete the transaction
  Alert.alert(
    'Delete',
    'Are you sure you want to delete this transaction?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => console.log(`Deleted transaction with ID: ${transactionId}`) },
    ],
    { cancelable: true }
  );
};

export default function TransactionDetailsScreen() {
  const route = useRoute<TransactionDetailsRouteProp>();
  const navigation = useNavigation();
  const transaction = route.params?.transaction;

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Transaction details not available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" type="ionicon" color="#007AFF" size={24} />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.card}>
          <View style={styles.headerContainer}>
            <Icon
              name={transaction.type === 'income' ? 'arrow-down' : transaction.type === 'expense' ? 'arrow-up' : 'exchange'}
              type="font-awesome"
              color={transaction.type === 'income' ? '#4CAF50' : transaction.type === 'expense' ? '#F44336' : '#2196F3'}
              size={30}
              containerStyle={styles.headerIcon}
            />
            <Text h3 style={styles.title}>{transaction.description}</Text>
          </View>
          <Text style={styles.amount}>{formatAmount(transaction.amount, transaction.type)}</Text>
          <Text style={styles.date}>{format(parseISO(transaction.date), 'dd MMMM yyyy')}</Text>
          
          <Text style={styles.subcategory}>{transaction.category.name}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailsContainer}>
            <DetailRow icon="exchange" label="Type" value={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} />
            <DetailRow icon="arrow-right" label="From" value={accountNameFromId(transaction.fromAccountId)} />
            <DetailRow icon="arrow-left" label="To" value={accountNameFromId(transaction.toAccountId)} />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Edit"
              onPress={() => handleEdit(transaction.id)}
              buttonStyle={styles.editButton}
              icon={<Icon name="edit" type="font-awesome" color="white" size={16} />}
              titleStyle={styles.buttonTitle}
            />
            <Button
              title="Delete"
              onPress={() => handleDelete(transaction.id)}
              buttonStyle={styles.deleteButton}
              icon={<Icon name="trash" type="font-awesome" color="white" size={16} />}
              titleStyle={styles.buttonTitle}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
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
    marginBottom: 10,
  },
  headerIcon: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  divider: {
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
  subcategory: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 5,
  },
});