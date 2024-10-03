import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Dimensions, FlatList, Modal } from 'react-native';
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
import { createBank, createAccount } from './api/bankApi';
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler';
import { Bank } from '@/types/bank';
import { Transaction } from '@/types/transaction'; // Import the Transaction type if needed
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccounts } from '../actions/accountActions';
import { fetchBanks } from '../actions/bankActions';

// Define the navigation param list
type RootStackParamList = {
    TransactionsScreen: { account: Account };
    TransactionsScreenAccount: { account: Account };
};

// Define the navigation prop type
type AccountsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionsScreen' | 'TransactionsScreenAccount'>;

const filters = ['All', 'Checking', 'Savings', 'Investment'];

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
    const dispatch = useDispatch();
    const { accounts, accountsLoading, accountsError } = useSelector((state: any) => state.accounts);
    const { banks, banksLoading, banksError } = useSelector((state: any) => state.banks);
    const navigation = useNavigation<AccountsScreenNavigationProp>();
    const [selectedFilter, setSelectedFilter] = useState('All');
    const router = useRouter();
    const [wealthData, setWealthData] = useState([]);
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const foundBankNameById = (bankId: number) => {
        return banks.find((bank: Bank) => bank.id === bankId)?.name;
    };

    useEffect(() => {
        dispatch(fetchAccounts());
        dispatch(fetchBanks());
    }, []);

    const filteredAccounts = useMemo(() => {
        if (selectedFilter === 'All') {
            return accounts.filter((account: Account) => account.type != 'income' && account.type != 'expense');
        }
        return accounts.filter((account: Account) => account.type === selectedFilter.toLowerCase());
    }, [selectedFilter, accounts]);

    const groupedAccounts = useMemo(() => {
        return filteredAccounts.reduce((groups: Record<string, Account[]>, account: Account) => {
            const bankName = foundBankNameById(account.bankId);
            if (!groups[bankName as string]) {
                groups[bankName as string] = [];
            }
            groups[bankName as string].push(account);
            return groups;
        }, {} as Record<string, Account[]>);
    }, [filteredAccounts, banks]);

    const handleAccountPress = (account: Account) => {
        if (account.type === 'checking' || account.type === 'savings') {
            navigation.navigate('TransactionsScreenAccount', {
                account: account
            });
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        router.replace('/login');
    };

    const totalBalance = useMemo(() => {
        return accounts.reduce((sum, account) => sum + account.balance, 0);
    }, [accounts]);

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

    const LogoutButton = () => (
        <Pressable
            style={styles.logoutButton}
            onPress={() => setIsLogoutModalVisible(true)}
        >
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </Pressable>
    );

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
                    </View>
                </View>
            </View>
        </Modal>
    );

    const handleAddAccountPress = () => {
        router.push('/AddAccountScreen', {
            refreshAccounts: () => loadData() // Pass the callback to refresh accounts
        });
    };

    const handleAddTransactionPress = () => {
        router.push('/AddTransactionScreen'); // Navigate to the Add Transaction screen
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PaperProvider>
                <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                    <StatusBar style="auto" />
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Accounts</Text>
                        <LogoutButton />
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {/* Total Balance */}
                        <View style={styles.totalBalanceContainer}>
                            <Text style={styles.totalBalance}>{totalBalance.toLocaleString()} €</Text>
                            <Text style={styles.totalBalanceLabel}>total balance</Text>
                        </View>

                        {/* Wealth over time */}
                        <View style={styles.wealthOverTimeContainer}>
                            <VictoryChart
                                theme={VictoryTheme.material}                                
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
                        <Button
                            mode="contained"
                            onPress={handleAddAccountPress}
                            style={styles.addButton}
                            icon="plus"
                        >
                            Add Account
                        </Button>

                        {/* Add Transaction Button */}
                        <Button
                            mode="contained"
                            onPress={handleAddTransactionPress}
                            style={styles.addButton}
                            icon="plus"
                        >
                            Add Transaction
                        </Button>
                    </ScrollView>

                    <LogoutModal/>
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