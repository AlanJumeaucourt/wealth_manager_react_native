import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { VictoryArea, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { Provider as PaperProvider, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';

// Define the navigation param list
type RootStackParamList = {
  TransactionsScreen: { account: Account };
};

// Define the navigation prop type
type AccountsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionsScreen'>;

type AccountType = 'checking' | 'saving' | 'investment';

type Bank = {
  id: number;
  name: string;
}

// Define the Account type
type Account = {
  id: number;
  name: string;
  balance: number;
  bank: Bank;
  type: AccountType;
};

// Mock data for demonstration
const mockAccounts: Account[] = [
  { id: 1, name: 'Compte Courant', balance: 1500, bank: { id: 1, name: 'BNP Paribas' }, type: 'checking' },
  { id: 2, name: 'Livret A', balance: 5000, bank: { id: 1, name: 'BNP Paribas' }, type: 'saving' },
  { id: 3, name: 'PEL', balance: 7000, bank: { id: 2, name: 'Société Générale' }, type: 'investment' },
  { id: 4, name: 'Compte Joint', balance: 3000, bank: { id: 3, name: 'Crédit Agricole' }, type: 'checking' },
  { id: 5, name: 'PEA', balance: 10000, bank: { id: 4, name: 'Société Générale' }, type: 'investment' },
  { id: 6, name: 'CTO', balance: 12000, bank: { id: 4, name: 'Société Générale' }, type: 'investment' },
];

const wealthOverTimeData = Array.from({ length: 60 }, (_, index) => ({
  x: index + 1,
  y: 37000 + (index * 100)
}));

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

// Créez un tableau de banques uniques à partir des comptes existants
const uniqueBanks = Array.from(new Set(mockAccounts.map(account => account.bank.name)));

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

  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 40; // 20 de chaque côté
  const totalGapWidth = 30; // Espace total entre les boutons (10 * 3)
  const filterButtonWidth = (screenWidth - containerPadding - 32 - totalGapWidth) / filters.length;

  // Filter accounts based on the selected filter
  const filteredAccounts = useMemo(() => {
    if (selectedFilter === 'All') {
      return mockAccounts;
    }
    return mockAccounts.filter(account =>
      account.type.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [selectedFilter]);

  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balance, 0);

  // Group filtered accounts by bank
  const groupedAccounts = useMemo(() => {
    return filteredAccounts.reduce((acc: Record<string, Account[]>, account) => {
      if (!acc[account.bank.name]) {
        acc[account.bank.name] = [];
      }
      acc[account.bank.name].push(account);
      return acc;
    }, {});
  }, [filteredAccounts]);

  const handleScroll = (event: any) => {
    const currentPosition = event.nativeEvent.contentOffset.x;
    if (currentPosition > scrollPosition) {
      // Scrolled right to left
      const currentIndex = filters.indexOf(selectedFilter);
      if (currentIndex < filters.length - 1) {
        setSelectedFilter(filters[currentIndex + 1]);
      }
    } else if (currentPosition < scrollPosition) {
      // Scrolled left to right
      const currentIndex = filters.indexOf(selectedFilter);
      if (currentIndex > 0) {
        setSelectedFilter(filters[currentIndex - 1]);
      }
    }
    setScrollPosition(currentPosition);
  };

  const handleAccountPress = (account: Account) => {
    if (account.type === 'checking' || account.type === 'saving') {
      navigation.navigate('TransactionsScreen', {
        account: account
      });
    }
  };

  // These snapPoints define the height of the bottom sheet at different stages
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsBottomSheetVisible(true);
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setIsBottomSheetVisible(false);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar style="auto" />

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
              width={500}
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
                data={wealthOverTimeData}
                x="x"
                y="y"
                style={{ data: { fill: colors.primary } }}
              />
            </VictoryChart>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollViewContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {filters.map((filter, index) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.selectedFilter,
                    { width: filterButtonWidth },
                    index < filters.length - 1 && { marginRight: 10 } // Ajoute une marge à droite sauf pour le dernier bouton
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text style={[styles.filterText, selectedFilter === filter && styles.selectedFilterText]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Grouped Accounts List */}
          {Object.keys(groupedAccounts).length > 0 ? (
            <View>
              {Object.keys(groupedAccounts).map((bank) => (
                <View key={bank} style={styles.bankContainer}>
                  <Text style={styles.bankName}>{bank}</Text>
                  {groupedAccounts[bank].map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={styles.accountItem}
                      onPress={() => handleAccountPress(account)}
                    >
                      <View style={styles.accountHeader}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountBalance}>{account.balance.toLocaleString()} €</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noAccountsText}>No accounts found for this filter.</Text>
          )}

          {/* Add Account Button */}
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]} 
            onPress={openBottomSheet}
          >
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={[styles.addButtonText, { color: colors.white }]}>Add Account</Text>
          </TouchableOpacity>

          {/* Add the BottomSheet component */}
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
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
              <Button mode="contained" onPress={closeBottomSheet} style={styles.submitButton}>
                Add Account
              </Button>
            </View>
          </BottomSheet>
        </View>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'scroll',
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
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
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilter: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
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