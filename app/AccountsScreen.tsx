import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VictoryArea, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { Provider as PaperProvider, TextInput, Button as PaperButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { Account } from '@/types/account';
import { fetchAccounts, fetchWealthOverTime } from './api/mockApi';

// Define the navigation param list
type RootStackParamList = {
  TransactionsScreen: { account: Account };
};

// Define the navigation prop type
type AccountsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionsScreen'>;

const filters = ['All', 'Checking', 'Saving', 'Investment'];

// Définissez une palette de couleurs cohérente
const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f5f5f5',
  text: '#2c3e50',
  lightText: '#7f8c8d',
  white: '#ffffff',
  lightGray: '#ecf0f1',
  darkGray: '#bdc3c7',
};

export default function AccountsScreen() {
  const navigation = useNavigation<AccountsScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [isAddingNewBank, setIsAddingNewBank] = useState(false);
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [wealthData, setWealthData] = useState([]);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(-1);

  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 40; // 20 de chaque côté
  const totalGapWidth = 30; // Espace total entre les boutons (10 * 3)
  const filterButtonWidth = (screenWidth - containerPadding - totalGapWidth) / filters.length;

  useEffect(() => {
    const loadData = async () => {
      const fetchedAccounts = await fetchAccounts();
      setAccounts(fetchedAccounts);

      const fetchedWealthData = await fetchWealthOverTime();
      setWealthData(fetchedWealthData);
    };

    loadData();
  }, []);

  // Filter accounts based on the selected filter
  const filteredAccounts = useMemo(() => {
    if (selectedFilter === 'All') {
      return accounts.filter(account => account.type != 'income' && account.type != 'expense');
    }
    return accounts.filter(account => account.type === selectedFilter.toLowerCase());
  }, [selectedFilter, accounts]);

  // Group accounts by bank
  const groupedAccounts = useMemo(() => {
    return filteredAccounts.reduce((groups, account) => {
      const bankName = account.bank.name;
      if (!groups[bankName]) {
        groups[bankName] = [];
      }
      groups[bankName].push(account);
      return groups;
    }, {} as Record<string, Account[]>);
  }, [filteredAccounts]);

  const handleScroll = (event: any) => {
    const currentPosition = event.nativeEvent.contentOffset.y;
    if (currentPosition > scrollPosition) {
      // Scrolling down
      const currentIndex = filters.indexOf(selectedFilter);
      if (currentIndex < filters.length - 1) {
        setSelectedFilter(filters[currentIndex + 1]);
      }
    } else {
      // Scrolling up
      const currentIndex = filters.indexOf(selectedFilter);
      if (currentIndex > 0) {
        setSelectedFilter(filters[currentIndex - 1]);
      }
    }
    setScrollPosition(currentPosition);
  };

  const handleAccountPress = (account: Account) => {
    if (account.type === 'checking' || account.type === 'saving') {
      navigation.navigate('TransactionsScreenAccount', {
        account: account
      });
    }
  };

  // Update the snapPoints to include a closed state
  const snapPoints = useMemo(() => [1, '75%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    setBottomSheetIndex(index);
  }, []);

  const openBottomSheet = useCallback(() => {
    setBottomSheetIndex(1);
  }, []);

  const closeBottomSheet = useCallback(() => {
    setBottomSheetIndex(0);
  }, []);

  const handleBankSelection = (itemValue: string) => {
    if (itemValue === 'add_new') {
      setIsAddingNewBank(true);
      setNewBankName('');
    } else {
      setIsAddingNewBank(false);
      setSelectedBank(itemValue);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);

  // Créez un tableau de banques uniques à partir des comptes existants
  const uniqueBanks = Array.from(new Set(accounts.map(account => account.bank.name)));

  const renderFilterItem = ({ item }) => (
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar style="auto" />
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {/* Total Balance */}
            <View style={styles.totalBalanceContainer}>
              <Text style={styles.totalBalance}>{totalBalance.toLocaleString()} €</Text>
              <Text style={styles.totalBalanceLabel}>total balance</Text>
            </View>

            {/* Wealth over time */}
            <View style={styles.wealthOverTimeContainer}>
              <VictoryChart
                theme={VictoryTheme.grayscale}
                domainPadding={20}
                width={Dimensions.get('window').width - 40}
                height={200}
              >
                <VictoryAxis
                  fixLabelOverlap={true}
                  tickValues={[1, 10, 20, 30, 40, 50]}
                  tickFormat={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t) => `${t}€`}
                  style={{
                    tickLabels: { padding: 5 }
                  }}
                />
                <VictoryArea
                  data={wealthData}
                  x="x"
                  y="y"
                  style={{ data: { fill: colors.primary } }}
                />
              </VictoryChart>
            </View>

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
                    {groupedAccounts[bank].map((account) => (
                      <Pressable
                        key={account.id}
                        style={styles.accountItem}
                        onPress={() => handleAccountPress(account)}
                      >
                        <View style={styles.accountHeader}>
                          <Text style={styles.accountName}>{account.name}</Text>
                          <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>
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
            <Pressable 
              style={[styles.addButton, { backgroundColor: colors.primary }]} 
              onPress={openBottomSheet}
            >
              <Ionicons name="add" size={24} color={colors.white} />
              <Text style={[styles.addButtonText, { color: colors.white }]}>Add Account</Text>
            </Pressable>

            <Button title="Logout" onPress={handleLogout} />
          </ScrollView>

          {/* Add the BottomSheet component */}
          <BottomSheet
            ref={bottomSheetRef}
            index={bottomSheetIndex}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
          >
            <View style={styles.bottomSheetContent}>
              <Text style={styles.bottomSheetTitle}>Add New Account</Text>
              <TextInput
                label="Account Name"
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Initial Balance"
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Bank Name</Text>
                <Picker
                  selectedValue={isAddingNewBank ? 'add_new' : selectedBank}
                  onValueChange={handleBankSelection}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a bank" value="" />
                  {uniqueBanks.map((bank) => (
                    <Picker.Item key={bank} label={bank} value={bank} />
                  ))}
                  <Picker.Item label="Add new bank" value="add_new" />
                </Picker>
              </View>
              {isAddingNewBank && (
                <TextInput
                  label="New Bank Name"
                  mode="outlined"
                  value={newBankName}
                  onChangeText={setNewBankName}
                  style={styles.input}
                />
              )}
              <PaperButton mode="contained" onPress={closeBottomSheet} style={styles.submitButton}>
                Add Account
              </PaperButton>
            </View>
          </BottomSheet>
        </SafeAreaView>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
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
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
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
});