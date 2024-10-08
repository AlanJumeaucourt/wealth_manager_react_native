import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineGraph, AxisLabel } from 'react-native-graph';
import { Provider as PaperProvider, TextInput, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Account } from '@/types/account';
import { Bank } from '@/types/bank';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../actions/accountActions';
import { fetchBanks } from '../actions/bankActions';
import { colors } from '../constants/colors';
import AddTransactionScreen from './AddTransactionScreen';
import AddAccountScreen from './AddAccountScreen';
import { createStackNavigator } from '@react-navigation/stack';
import TransactionsScreenAccount from './TransactionsScreenAccount';
import TransactionDetails from './TransactionDetails';
import sharedStyles from './styles/sharedStyles';
import { fetchWealthData } from '@/app/api/bankApi'; // Import the new API function
import { ActivityIndicator } from 'react-native-paper';

interface DataPoint {
  date: Date;
  value: number;
}
// Define the navigation param list
type RootStackParamList = {
  TransactionsScreen: { account: Account };
  TransactionsScreenAccount: { account: Account };
};

// Define the navigation prop type
type AccountsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionsScreen' | 'TransactionsScreenAccount'>;

const filters = ['All', 'Checking', 'Savings', 'Investment'];

const Stack = createStackNavigator();

// Define the type for wealth data
type WealthDataPoint = { [date: string]: number };

export default function AccountsScreen() {
  const dispatch = useDispatch();
  const { accounts, accountsLoading, accountsError } = useSelector((state: any) => state.accounts);
  const { banks, banksLoading, banksError } = useSelector((state: any) => state.banks);
  const navigation = useNavigation<AccountsScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const router = useRouter();
  const [wealthData, setWealthData] = useState<WealthDataPoint[]>([]); // State to hold wealth data
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Ajoutez cet état
  const [isLoading, setIsLoading] = useState(true);


  const foundBankNameById = (bankId: number) => {
    return banks.find((bank: Bank) => bank.id === bankId)?.name;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("fetchData called");
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6); // 6 months ago
        console.log("startDate", startDate);
        const endDate = new Date(); // Current date
        console.log("endDate", endDate);
        const response = await fetchWealthData(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
        console.log("response", response);
        if (response) {
          setWealthData(response);
        }
        else {
          console.log("No response");
        }
        setIsLoading(false);
        console.log("wealthData", wealthData);
      } catch (error) {
        console.error('Error fetching wealth data:', error);
        setIsLoading(false);
      }
    };

    console.log("wealthData", wealthData);
    fetchData();
    dispatch(fetchAccounts() as unknown); // Cast to unknown to satisfy TypeScript
    dispatch(fetchBanks() as unknown); // Cast to unknown to satisfy TypeScript
  }, [dispatch, refreshKey]);

  const filteredAccounts = useMemo(() => {
    if (selectedFilter === 'All') {
      return accounts.filter((account:
        Account) => account.type != 'income' && account.type != 'expense');
    }
    return accounts.filter((account: Account) => account.type === selectedFilter.toLowerCase());
  }, [selectedFilter, accounts, dispatch]);

  const groupedAccounts = useMemo(() => {
    const groups = filteredAccounts.reduce((groups: Record<string, Account[]>, account: Account) => {
      const bankName = foundBankNameById(account.bank_id);
      if (!groups[bankName as string]) {
        groups[bankName as string] = [];
      }
      groups[bankName as string].push(account);
      return groups;
    }, {} as Record<string, Account[]>);

    // Sort banks alphabetically
    const sortedGroups: Record<string, Account[]> = {};
    Object.keys(groups).sort().forEach(key => {
      // Sort accounts within each bank alphabetically
      sortedGroups[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return sortedGroups;
  }, [filteredAccounts, banks, accounts, dispatch]);

  // Ajoutez cette fonction
  const refreshAccounts = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Modifiez la navigation pour inclure la fonction de rafraîchissement
  const handleAccountPress = (account: Account) => {
    if (account.type === 'checking' || account.type === 'savings' || account.type === 'investment') {
      navigation.navigate('TransactionsScreenAccount', { account: account }); // Remove refreshAccounts from params
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    router.replace('/login');
  };

  const formatCompactNumber = (number: number) => {
    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1) + 'M';
    } else if (number >= 1_000) {
      return (number / 1_000).toFixed(1) + 'k';
    }
    return number.toString();
  };

  const totalBalance = useMemo(() => {
    return filteredAccounts.reduce((sum: number, account: Account) => sum + account.balance, 0);
  }, [filteredAccounts, dispatch]);

  const renderFilterItem = ({ item }: { item: string }) => ( // Specify type for item
    <Pressable
      style={[
        styles.filterButton,
        selectedFilter === item && styles.selectedFilter,
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text style={[styles.filterText, selectedFilter === item && styles.selectedFilterText]}>
        {item}
      </Text>
    </Pressable>
  );

  const LogoutButton = () => (
    <Pressable
      style={styles.logoutButton}
      onPress={() => setIsLogoutModalVisible(true)}
    >
      <Ionicons name="log-out-outline" size={24} color={colors.text} />
    </Pressable>
  );

  const refreshPage = () => {
    router.reload();
  };

  const LogoutModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isLogoutModalVisible}
      onRequestClose={() => setIsLogoutModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Logout</Text>
          <Text style={styles.modalText}>Are you sure you want to logout?</Text>
          <View style={styles.modalButtons}>
            <PaperButton
              mode="outlined"
              onPress={() => setIsLogoutModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </PaperButton>
            <PaperButton
              mode="contained"
              onPress={handleLogout}
              style={styles.modalButton}
            >
              Logout
            </PaperButton>
            <PaperButton
              mode="contained"
              onPress={refreshPage}
              style={styles.modalButton}
            >
              refreshPage
            </PaperButton>
          </View>
        </View>
      </View>
    </Modal>
  );

  const formatNumber = (number: number) => {
    return number.toLocaleString('en-US', { style: 'currency', currency: 'EUR' });
  };

  const handlePointClick = (point: { x: number, y: number }) => {
    console.log(`Clicked on point: x=${point.x}, y=${point.y}`);
    // You can add more logic here to handle the click event
  };
  const labels = Object.keys(wealthData);
  const values = Object.values(wealthData);

  const points: DataPoint[] = labels.map((label, index) => ({
    date: new Date(label),
    value: values[index],
  }));

  const handlePointSelect = (point: DataPoint) => {
    console.log("point", point);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accounts</Text>
        <LogoutButton />
      </View>
      <View style={sharedStyles.body}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Total Balance */}
          <View style={styles.totalBalanceContainer}>
            <Text style={styles.totalBalance}>{formatCompactNumber(totalBalance)} €</Text>
            <Text style={styles.totalBalanceLabel}>total balance</Text>
          </View>

          {/* Wealth over time */}
          {isLoading && Object.keys(wealthData).length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator animating={true} size="large" color={colors.primary} />
            </View>
          )}
          {points.length > 0 && (
            <View style={styles.graphContainer}>
              <LineGraph
                points={points}
                color="#4484B2"
                animated={true}
                enablePanGesture={true}
                onPointSelected={handlePointSelect}
                style={styles.graph}
              />
            </View>
          )}


          {/* Filters */}
          <View style={styles.filtersContainer}>
            <FlatList
              data={filters}
              renderItem={renderFilterItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.filtersScrollViewContent}
            />
          </View>

          {/* Grouped Accounts List */}
          {Object.keys(groupedAccounts).length > 0 ? (
            <View>
              {Object.keys(groupedAccounts).map((bank) => (
                <View key={bank} style={styles.bankContainer}>
                  <Text style={styles.bankName}>{bank}</Text>
                  {groupedAccounts[bank].map((account: Account) => (
                    <Pressable
                      key={account.id}
                      style={styles.accountItem}
                      onPress={() => handleAccountPress(account)}
                    >
                      <View style={styles.accountHeader}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountBalance}>{formatNumber(account.balance)} €</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noAccountsText}>No accounts found for this filter.</Text>
          )}

          {/* Add Account Button */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddAccount' as never)}
            style={styles.addButton}
            icon="plus"
          >
            Add Account
          </Button>

          {/* Add Transaction Button */}
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddTransaction' as never)}
            style={styles.addButton}
            icon="plus"
          >
            Add Transaction
          </Button>
        </ScrollView>
      </View>
      <LogoutModal />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 50,
    paddingBottom: 20,
  },
  totalBalanceContainer: {
    marginBottom: 20,
  },
  totalBalanceLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.lightText,
  },
  totalBalance: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
  },
  wealthOverTimeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 8,
  },
  filtersScrollViewContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  selectedFilterText: {
    color: colors.white,
  },
  accountItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: colors.text,
  },
  accountBalance: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  bankName: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    color: colors.text,
  },
  bankContainer: {
    backgroundColor: colors.white,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  noAccountsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: colors.lightText,
  },
  bottomSheetContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32, // Add extra padding at the bottom
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  submitButton: {
    width: '100%',
    marginTop: 16,
    backgroundColor: colors.primary,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 12,
    color: colors.lightText,
    marginBottom: 4,
  },
  picker: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    width: '45%',
  },
  newBankContainer: {
    width: '100%',
    marginBottom: 16,
  },
});