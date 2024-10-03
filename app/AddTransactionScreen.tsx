import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Pressable } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Transaction } from '@/types/transaction';
import { colors } from '@/constants/colors';
import { Account } from '@/types/account';
import { createAccount, createTransaction, fetchAccounts } from './api/bankApi';
import SearchableModal from '@/app/components/SearchableModal';

const AddTransactionScreen = () => {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState('expense');
    const [fromAccountId, setFromAccountId] = useState<number | null>(null);
    const [selectedFromAccountName, setSelectedFromAccountName] = useState<string>('');
    const [toAccountId, setToAccountId] = useState<number | null>(null);
    const [selectedToAccountName, setSelectedToAccountName] = useState<string>('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);

    const createNewAccount = async (accountName: string, accountType: string, setAccountId: React.Dispatch<React.SetStateAction<number | null>>) => {
        const newAccount = {
            name: accountName,
            type: accountType,
            bankId: 1,
            currency: 'EUR',
        };

        const newAccountResponse = await createAccount(newAccount);
        newAccount.id = newAccountResponse.id;

        setAccounts([...accounts, newAccount]);
        setAccountId(newAccount.id);
        console.log('Creating new account with name:', accountName);
    };

    const handleSubmit = async () => {
        if (selectedFromAccountName && !fromAccountId && transactionType === 'income') {
            await createNewAccount(selectedFromAccountName, 'income', setFromAccountId);
        }

        if (selectedToAccountName && !toAccountId && transactionType === 'expense') {
            await createNewAccount(selectedToAccountName, 'expense', setToAccountId);
        }

        if (fromAccountId && toAccountId) {
            const newTransaction: Transaction = {
                id: Date.now(),
                date: new Date().toISOString(),
                description,
                amount: parseFloat(amount),
                type: transactionType,
                fromAccountId: fromAccountId,
                toAccountId: toAccountId,
                category: { name: category },
                subCategory: { name: subCategory },
            };

            createTransaction(newTransaction);
        } else {
            console.error('Invalid account selection');
            console.error('fromAccountId:', fromAccountId);
            console.error('toAccountId:', toAccountId);
            return;
        }


        console.log('Transaction submitted:', newTransaction);
        // router.back();
    };

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const accountsData = await fetchAccounts();
                setAccounts(accountsData);
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        };

        loadAccounts();
    }, []);

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

    return (
        <View style={styles.container}>
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

            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                Add Transaction
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    }
});

export default AddTransactionScreen;