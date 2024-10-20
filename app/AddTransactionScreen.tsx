import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, ScrollView, Modal, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { Transaction } from '@/types/transaction';
import { colors } from '@/constants/colors';
import { Account } from '@/types/account';
import { createAccount, createTransaction, updateTransaction } from './api/bankApi';
import SearchableModal from '@/app/components/SearchableModal';
import { expenseCategories, incomeCategories } from '@/constants/categories';
import { Category } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAccounts } from '@/actions/accountActions';
import { BackButton } from './components/BackButton';
import DatePicker from 'react-native-ui-datepicker';
import { fetchTransactions } from '@/actions/transactionActions';
import { useRoute } from '@react-navigation/native';
import { findCategoryByName } from '../utils/categoryUtils'; // Import the utility function

const accountNameFromId = (accountId: number, accounts: Account[]) => {
    if (!accounts || !Array.isArray(accounts)) {
      return accountId.toString();
    }
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : accountId.toString();
};

export default function AddTransactionScreen() {
    const route = useRoute();
    const dispatch = useDispatch();
    const transaction = route.params?.transaction as Transaction | undefined;
    const accounts = useSelector((state: RootState) => state.accounts.accounts);

    console.log('route.params : ', route.params);
    
    const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
    const [description, setDescription] = useState(transaction ? transaction.description : '');
    const [transactionType, setTransactionType] = useState(transaction ? transaction.type : 'expense');
    const [fromAccountId, setFromAccountId] = useState<number | null>(transaction ? transaction.from_account_id : null);
    const [selectedFromAccountName, setSelectedFromAccountName] = useState<string>(transaction ? accountNameFromId(transaction.from_account_id, accounts) : '');
    const [toAccountId, setToAccountId] = useState<number | null>(transaction ? transaction.to_account_id : null);
    const [selectedToAccountName, setSelectedToAccountName] = useState<string>(transaction ? accountNameFromId(transaction.to_account_id, accounts) : '');
    const [category, setCategory] = useState(transaction ? transaction.category : '');
    const [subcategory, setSubcategory] = useState<string | null>(transaction ? transaction.subcategory : null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [transactionDate, setTransactionDate] = useState(transaction ? new Date(transaction.date) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);


    useEffect(() => {
        if (transactionType === 'transfer') {
            setCategory("Virements internes");
            setSubcategory(null);
        } else {
            setCategory('');
            setSubcategory(null);
        }
    }, [transactionType]);

    const createNewAccount = async (accountName: string, accountType: string, setAccountId: React.Dispatch<React.SetStateAction<number | null>>) => {
        try {
            const newAccount = {
                name: accountName,
                type: accountType,
                bank_id: 1,
                currency: 'EUR',
            };

            const newAccountResponse = await createAccount(newAccount);
            console.log('newAccountResponse', newAccountResponse);
            const createdAccount: Account = { ...newAccount, id: newAccountResponse.id };

            setAccountId(createdAccount.id);
            console.log('Creating new account with name:', accountName);

            return createdAccount;
        } catch (error) {
            console.error('Error creating new account:', error);
            Alert.alert('Error', 'Failed to create a new account. Please try again.');
            throw error; // Re-throw to handle upstream if necessary
        }
    };

    const handleAddOrUpdateTransaction = async () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid number for the amount.');
            return;
        }

        const transactionData: Transaction = {
            date: transactionDate.toISOString().split('T')[0],
            description,
            amount: parsedAmount,
            type: transactionType,
            from_account_id: fromAccountId as number,
            to_account_id: toAccountId as number,
            category,
            subcategory: subcategory || null,
        };
        
        try {
            // Handle Account Creation if Necessary
            if (selectedFromAccountName && !fromAccountId && transactionType === 'income') {
                const newAccount = await createNewAccount(selectedFromAccountName, 'income', setFromAccountId);
                setFromAccountId(newAccount.id);
            }
            
            console.log(selectedToAccountName, toAccountId, transactionType);
            if (selectedToAccountName && !toAccountId && transactionType === 'expense') {
                const newAccount = await createNewAccount(selectedToAccountName, 'expense', setToAccountId);
                setToAccountId(newAccount.id);
            }

            // Ensure both accounts are selected
            if (fromAccountId !== null && toAccountId !== null) {

                if (transaction) {
                    await updateTransaction(transaction.id, transactionData);
                    Alert.alert('Success', 'Transaction updated successfully!');
                } else {
                    await createTransaction(transactionData);
                    Alert.alert('Success', 'Transaction created successfully!');
                }
                dispatch(fetchAccounts());
                dispatch(fetchTransactions());
            } else {
                console.error('Invalid account selection');
                console.error('localFromAccountId:', fromAccountId);
                console.error('localToAccountId:', toAccountId);

                Alert.alert('Invalid Account Selection', 'Please select valid accounts before proceeding.');
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            Alert.alert('Error', 'An error occurred while submitting the transaction. Please try again.');
        }
    };

    useEffect(() => {
        dispatch(fetchAccounts());
        dispatch(fetchTransactions());
    }, [dispatch]);

    const transactionTypes = ['expense', 'income', 'transfer'];

    const renderTransactionTypeItem = ({ item }: { item: string }) => {
        let backgroundColor;
        switch (item) {
            case 'income':
                backgroundColor = "#4CAF50";
                break;
            case 'expense':
                backgroundColor = "#F44336";
                break;
            case 'transfer':
                backgroundColor = "#2196F3";
                break;
            default:
                backgroundColor = colors.lightGray;
        }

        return (
            <Pressable
                style={[
                    styles.filterButton,
                    transactionType === item && { backgroundColor },
                ]}
                onPress={() => setTransactionType(item)}
            >
                <Text style={[styles.filterText, transactionType === item && styles.selectedFilterText]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
            </Pressable>
        );
    };

    const fromAccountFilter = (transactionType: string, accounts: Account[]) => {
        switch (transactionType) {
            case 'income':
                return accounts.filter(account => account.type === 'income');
            case 'expense':
                return accounts.filter(account => account.type === 'expense');
            case 'transfer':
                return accounts.filter(account => account.type !== 'income' && account.type !== 'expense');
            default:
                return [];
        }
    };

    const toAccountFilter = (transactionType: string, accounts: Account[]) => {
        switch (transactionType) {
            case 'income':
                return accounts.filter(account => account.type !== 'income' && account.type !== 'expense');
            case 'expense':
                return accounts.filter(account => account.type === 'expense');
            case 'transfer':
                return accounts.filter(account => account.type !== 'income' && account.type !== 'expense');
            default:
                return [];
        }
    };

    const CategorySelector = ({ transactionType, onSelectCategory, onSelectSubcategory }) => {
        const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
        const [showSubCategories, setShowSubCategories] = useState(false);

        const categories = transactionType === 'expense' ? expenseCategories : incomeCategories;

        const handleCategorySelect = (category: Category) => {
            setSelectedCategory(category);
            if (category.subCategories && category.subCategories.length > 0) {
                setShowSubCategories(true);
            } else {
                onSelectCategory(category.name);
                onSelectSubcategory(null);
                setIsCategoryModalVisible(false);
            }
        };

        const handleSubcategorySelect = (subcategory: { name: string }) => {
            if (selectedCategory) {
                onSelectCategory(selectedCategory.name);
                onSelectSubcategory(subcategory.name);
                setIsCategoryModalVisible(false);
            }
        };

        const handleBack = () => {
            if (showSubCategories) {
                setShowSubCategories(false);
            } else {
                setIsCategoryModalVisible(false);
            }
        };

        const renderCategoryItem = ({ item }: { item: Category }) => (
            <Pressable
                style={styles.categoryItem}
                onPress={() => handleCategorySelect(item)}
            >
                <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                    {item.iconSet === 'Ionicons' && (
                        <Ionicons name={item.iconName as any} size={16} color="white" />
                    )}
                </View>
                <Text style={styles.categoryText}>{item.name}</Text>
            </Pressable>
        );

        const renderSubcategoryItem = ({ item }: { item: { name: string, iconName: string } }) => (
            <Pressable
                style={styles.subcategoryItem}
                onPress={() => handleSubcategorySelect(item)}
            >
                <Ionicons name={item.iconName} size={24} color={colors.primary} />
                <Text style={styles.subcategoryText}>{item.name}</Text>
            </Pressable>
        );

        return (
            <View style={styles.categoryContainer}>
                {!showSubCategories ? (
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.name}
                        numColumns={3}
                        contentContainerStyle={styles.categoryGrid}
                    />
                ) : (
                    <View>
                        <View style={styles.selectedCategoryContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: selectedCategory?.color }]}>
                                {selectedCategory?.iconSet === 'Ionicons' && (
                                    <Ionicons name={selectedCategory?.iconName as any} size={16} color="white" />
                                )}
                            </View>
                            <Text style={styles.selectedCategoryText}>{selectedCategory?.name}</Text>
                        </View>
                        <FlatList
                            data={selectedCategory?.subCategories}
                            renderItem={renderSubcategoryItem}
                            keyExtractor={(item) => item.name}
                            numColumns={2}
                            contentContainerStyle={styles.subcategoryGrid}
                        />
                    </View>
                )}
                <Button
                    mode="outlined"
                    onPress={handleBack}
                    style={styles.closeButton}
                >
                    {showSubCategories ? 'Back' : 'Close'}
                </Button>
            </View>
        );
    };

    const handleCategorySelect = (selectedCategory: string) => {
        if (selectedCategory) {
            setCategory(selectedCategory);
        }
        setIsCategoryModalVisible(false);
    };

    const handleSubcategorySelect = (selectedSubcategory: string | null) => {
        setSubcategory(selectedSubcategory);
        setIsCategoryModalVisible(false);
    };

    const handleDateChange = (date: string) => {
        console.log('Selected date:', date);
        setTransactionDate(new Date(date)); // Update the transaction date
        setShowDatePicker(false); // Close the date picker
    };

    return (
        <View style={styles.container}>
            <BackButton />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>{transaction ? `Edit Transaction` : 'Add New Transaction'}</Text>
                <View style={styles.filtersContainer}>
                    <FlatList
                        data={transactionTypes}
                        renderItem={renderTransactionTypeItem}
                        keyExtractor={(item) => item}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={styles.filtersScrollViewContent}
                    />
                </View>

                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount (e.g., 100.00)"
                    placeholderTextColor={colors.lightText}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter description (e.g., Grocery shopping)"
                    placeholderTextColor={colors.lightText}
                    value={description}
                    onChangeText={setDescription}
                />

                <SearchableModal
                    data={fromAccountFilter(transactionType, accounts)}
                    onSelect={(value) => {
                        if (typeof value === 'string') {
                            setSelectedFromAccountName(value);
                            setFromAccountId(null);
                        } else {
                            setFromAccountId(value);
                            const selectedAccount = accounts.find(account => account.id === value);
                            setSelectedFromAccountName(selectedAccount ? selectedAccount.name : '');
                        }
                    }}
                    placeholder={selectedFromAccountName || "Select an account"}
                    label="From account"
                    allowCustomValue={transactionType === 'income'}
                />

                <SearchableModal
                    data={toAccountFilter(transactionType, accounts)}
                    onSelect={(value) => {
                        if (typeof value === 'string') {
                            setSelectedToAccountName(value);
                            setToAccountId(null);
                        } else {
                            setToAccountId(value);
                            const selectedAccount = accounts.find(account => account.id === value);
                            setSelectedToAccountName(selectedAccount ? selectedAccount.name : '');
                        }
                    }}
                    placeholder={selectedToAccountName || "Select an account"}
                    label="To account"
                    allowCustomValue={transactionType === 'expense'}
                />

                <Text style={styles.label}>Category</Text>
                {transactionType === 'transfer' ? (
                    <View style={styles.categoryButton}>
                        <Text style={styles.categoryButtonText}>Virements internes</Text>
                    </View>
                ) : (
                    <Pressable
                        style={styles.categoryButton}
                        onPress={() => setIsCategoryModalVisible(true)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {subcategory && (
                                <View style={[styles.iconCircle, { backgroundColor: findCategoryByName(category)?.color, marginRight: 10 }]}>
                                    <Ionicons
                                        name={
                                            findCategoryByName(category)?.subCategories?.find(
                                                sub => sub.name.toLowerCase() === subcategory.toLowerCase()
                                        )?.iconName || "chevron-forward"
                                        }
                                        size={20}
                                        color={colors.white}    
                                    />
                                </View>
                            )}
                            {category && !subcategory && (
                                <View style={[styles.iconCircle, { backgroundColor: findCategoryByName(category)?.color, marginRight: 10 }]}>
                                    <Ionicons
                                        name={
                                            findCategoryByName(category)?.iconName || "chevron-forward"
                                        }
                                        size={20}
                                        color={colors.white}    
                                    />
                                </View>
                            )}
                            <Text style={styles.categoryButtonText}>
                                {category ? `${category}${subcategory ? ` - ${subcategory}` : ''}` : 'Select Category'}
                            </Text>
                        </View>
                    </Pressable>
                )}

                <Modal
                    visible={isCategoryModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsCategoryModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.label}>Select Category</Text>
                            <CategorySelector
                                transactionType={transactionType}
                                onSelectCategory={handleCategorySelect}
                                onSelectSubcategory={handleSubcategorySelect}
                            />
                        </View>
                    </View>
                </Modal>

                <Text style={styles.label}>Transaction Date</Text>
                <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateButtonText}>{transactionDate.toLocaleDateString()}</Text>
                </Pressable>

                {/* Modal for DatePicker */}
                <Modal
                    visible={showDatePicker}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <DatePicker
                                date={transactionDate}
                                onChange={(params) => handleDateChange(params.date)}
                                mode="single"
                            />
                            <Button mode="outlined" onPress={() => setShowDatePicker(false)} style={styles.closeButton}>
                                Close
                            </Button>
                        </View>
                    </View>
                </Modal>

                <Button mode="contained" onPress={handleAddOrUpdateTransaction} style={styles.button}>
                    <Text style={styles.buttonText}>{transaction ? 'Update Transaction' : 'Add Transaction'}</Text>
                </Button>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
    },
    input: {
        height: 50,
        borderColor: colors.darkGray,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filtersContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    filtersScrollViewContent: {
        paddingHorizontal: 16,
    },
    filterButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: colors.lightGray,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        minWidth: 100,
    },
    filterText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 14,
    },
    selectedFilterText: {
        color: colors.white,
    },
    label: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: "#fff",
    },
    categoryContainer: {
        marginBottom: 16,
    },
    categoryGrid: {
        justifyContent: 'space-between',
    },
    categoryItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 4,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        minWidth: '30%',
    },
    categoryText: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 12,
    },
    subcategoryGrid: {
        justifyContent: 'space-between',
    },
    subcategoryItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 4,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        minWidth: '45%',
    },
    subcategoryText: {
        textAlign: 'center',
        fontSize: 14,
    },
    selectedCategoryText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        textAlign: 'center',
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.darkGray,
    },
    categoryButtonText: {
        fontSize: 16,
        color: colors.text,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    closeButton: {
        marginTop: 16,
    },
    dateButton: {
        padding: 16,
        backgroundColor: colors.lightGray,
        borderRadius: 10,
        marginBottom: 12,
    },
    dateButtonText: {
        fontSize: 16,
        color: colors.text,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
});
