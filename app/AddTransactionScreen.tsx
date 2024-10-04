import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, ScrollView, Modal, Animated } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Transaction } from '@/types/transaction';
import { colors } from '@/constants/colors';
import { Account } from '@/types/account';
import { createAccount, createTransaction } from './api/bankApi';
import SearchableModal from '@/app/components/SearchableModal';
import { budgetExpensesCategories, budgetIncomesCategories } from '@/constants/categories';
import { Category } from '@/types/category';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { fetchAccounts } from '@/actions/accountActions';
import { BackButton } from './components/BackButton';
import DatePicker from 'react-native-ui-datepicker'; // Import react-native-ui-datepicker

export default function AddTransactionScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('expense');
    const [fromAccountId, setFromAccountId] = useState<number | null>(null);
    const [selectedFromAccountName, setSelectedFromAccountName] = useState<string>('');
    const [toAccountId, setToAccountId] = useState<number | null>(null);
    const [selectedToAccountName, setSelectedToAccountName] = useState<string>('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState<string | null>(null);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const popupAnim = useRef(new Animated.Value(-50)).current;
    const [transactionDate, setTransactionDate] = useState(new Date()); // Add state for transaction date
    const [showDatePicker, setShowDatePicker] = useState(false); // State to control date picker visibility

    const accounts = useSelector((state: RootState) => state.accounts.accounts);

    useEffect(() => {
        if (transactionType === 'transfer') {
            setCategory("Virements internes");
            setSubCategory(null);
        } else {
            setCategory('');
            setSubCategory(null);
        }
    }, [transactionType]);

    const createNewAccount = async (accountName: string, accountType: string, setAccountId: React.Dispatch<React.SetStateAction<number | null>>) => {
        const newAccount = {
            name: accountName,
            type: accountType,
            bankId: 1,
            currency: 'EUR',
        };

        const newAccountResponse = await createAccount(newAccount);
        console.log('newAccountResponse', newAccountResponse);
        const createdAccount = { ...newAccount, id: newAccountResponse.id };

        setAccounts(prevAccounts => [...prevAccounts, createdAccount]);
        setAccountId(createdAccount.id);
        console.log('Creating new account with name:', accountName);

        return createdAccount;
    };

    const showPopup = (message: string, color: string) => {
        setPopupMessage(message);
        setPopupVisible(true);
        Animated.sequence([
            Animated.timing(popupAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(popupAnim, {
                toValue: -50,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setPopupVisible(false));
    };

    const handleSubmit = async () => {
        try {
            let localFromAccountId = fromAccountId;
            let localToAccountId = toAccountId;

            if (selectedFromAccountName && !localFromAccountId && transactionType === 'income') {
                const newAccount = await createNewAccount(selectedFromAccountName, 'income', setFromAccountId);
                localFromAccountId = newAccount.id;
            }

            if (selectedToAccountName && !localToAccountId && transactionType === 'expense') {
                const newAccount = await createNewAccount(selectedToAccountName, 'expense', setToAccountId);
                localToAccountId = newAccount.id;
            }

            console.log('localFromAccountId', localFromAccountId);
            console.log('localToAccountId', localToAccountId);

            if (localFromAccountId !== null && localToAccountId !== null) {
                const newTransaction: Transaction = {
                    id: Date.now(),
                    date: transactionDate.toISOString().split('T')[0], // Use the selected transaction date
                    description,
                    amount: parseFloat(amount),
                    type: transactionType,
                    fromAccountId: localFromAccountId,
                    toAccountId: localToAccountId,
                    category: category,
                    subCategory: subCategory || null,
                };

                await createTransaction(newTransaction);
                console.log('Transaction submitted:', newTransaction);

                // Dispatch action to fetch updated accounts and transactions
                dispatch(fetchAccounts()); // Ensure this action updates the transactions as well
                showPopup('Transaction created successfully!');

                // // Clear form fields
                // setAmount('');
                // setDescription('');
                // setCategory('');
                // setSubCategory(null);
                // setSelectedFromAccountName('');
                // setSelectedToAccountName('');
                // setFromAccountId(null);
                // setToAccountId(null);
            } else {
                console.error('Invalid account selection');
                console.error('localFromAccountId:', localFromAccountId);
                console.error('localToAccountId:', localToAccountId);

                showPopup('Invalid account selection. Please try again.', "#F44336");
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            showPopup('An error occurred. Please try again.', "#F44336");
        }
    };

    useEffect(() => {
        dispatch(fetchAccounts());
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
                    {item}
                </Text>
            </Pressable>
        );
    };

    const fromAccountFilter = (transactionType: string, accounts: Account[]) => {
        switch (transactionType) {
            case 'income':
                return accounts.filter(account => account.type === 'income');
            case 'expense':
                return accounts.filter(account => account.type !== 'income' && account.type !== 'expense');
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

    const CategorySelector = ({ transactionType, onSelectCategory, onSelectSubCategory }) => {
        const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
        const [showSubCategories, setShowSubCategories] = useState(false);

        const categories = transactionType === 'expense' ? budgetExpensesCategories : budgetIncomesCategories;

        const handleCategorySelect = (category: Category) => {
            setSelectedCategory(category);
            if (category.subCategories && category.subCategories.length > 0) {
                setShowSubCategories(true);
            } else {
                onSelectCategory(category.name);
                onSelectSubCategory(null);
                setIsCategoryModalVisible(false);
            }
        };

        const handleSubCategorySelect = (subCategory: { name: string }) => {
            onSelectCategory(selectedCategory!.name);
            onSelectSubCategory(subCategory.name);
            setIsCategoryModalVisible(false);
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
                <Ionicons name="folder-outline" size={24} color={colors.primary} />
                <Text style={styles.categoryText}>{item.name}</Text>
            </Pressable>
        );

        const renderSubCategoryItem = ({ item }: { item: { name: string } }) => (
            <Pressable
                style={styles.subCategoryItem}
                onPress={() => handleSubCategorySelect(item)}
            >
                <Text style={styles.subCategoryText}>{item.name}</Text>
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
                        <Text style={styles.selectedCategoryText}>{selectedCategory?.name}</Text>
                        <FlatList
                            data={selectedCategory?.subCategories}
                            renderItem={renderSubCategoryItem}
                            keyExtractor={(item) => item.name}
                            numColumns={2}
                            contentContainerStyle={styles.subCategoryGrid}
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

    const handleSubCategorySelect = (selectedSubCategory: string | null) => {
        setSubCategory(selectedSubCategory);
        setIsCategoryModalVisible(false);
    };

    const handleDateChange = (date: string) => {
        setTransactionDate(new Date(date)); // Update the transaction date
        setShowDatePicker(false); // Close the date picker
    };

    return (
        <View style={styles.container}>
            <BackButton />
            {popupVisible && (
                <Animated.View style={[styles.popup, { transform: [{ translateY: popupAnim }] }]}>
                    <Text style={styles.popupText}>{popupMessage}</Text>
                </Animated.View>
            )}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Add Transaction</Text>
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
                        <Text style={styles.categoryButtonText}>
                            {category ? `${category}${subCategory ? ` - ${subCategory}` : ''}` : 'Select Category'}
                        </Text>
                        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
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
                                onSelectSubCategory={handleSubCategorySelect}
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
                                <Text>Close</Text>
                            </Button>
                        </View>
                    </View>
                </Modal>

                <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                    <Text style={styles.buttonText}>Add Transaction</Text>
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
    selectedAccountText: {
        fontSize: 16,
        color: colors.darkGray,
        marginBottom: 12,
    },
    button: {
        marginTop: 16,
        marginBottom: 16,
    },
    buttonText: {
        color: "#fff"
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
    subCategoryGrid: {
        justifyContent: 'space-between',
    },
    subCategoryItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 4,
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        minWidth: '45%',
    },
    subCategoryText: {
        textAlign: 'center',
        fontSize: 14,
    },
    selectedCategoryText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
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
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 16,
    },
    popup: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 10,
        zIndex: 1000,
    },
    popupText: {
        color: 'white',
        textAlign: 'center',
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
});