import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Platform, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { fetchBanks, createBank, createAccount } from './api/bankApi';
import { Bank } from '@/types/bank';
import { ActionSheetIOS } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const colors = {
    primary: '#3498db',
    background: '#f5f5f5',
    text: '#2c3e50',
    lightText: '#7f8c8d',
    white: '#ffffff',
    lightGray: '#ecf0f1',
    darkGray: '#bdc3c7',
};

const accountTypes = ['Checking', 'Savings', 'Investment'];

export default function AddAccountScreen() {
    const dispatch = useDispatch();
    const { banks, banksLoading, banksError } = useSelector((state: any) => state.banks);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [newAccountCurrency, setNewAccountCurrency] = useState('');
    const [newBankName, setNewBankName] = useState('');
    const [isAddingNewBank, setIsAddingNewBank] = useState(false);
    const router = useRouter();

    useEffect(() => {
        dispatch(fetchBanks());
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

    const handleAddAccount = async () => {
        if (!newAccountName || !newAccountType || (!selectedBank && !newBankName) || !newAccountCurrency) {
            console.error('Please fill in all fields');
            return;
        }

        let bankId = parseInt(selectedBank);

        if (isAddingNewBank) {
            try {
                const newBank = await createBank(newBankName);
                setBanks([...banks, newBank]);
                bankId = newBank.id;
            } catch (error) {
                console.error('Error adding bank:', error);
                return;
            }
        }

        const newAccountData = {
            name: newAccountName,
            type: newAccountType,
            bankId: bankId,
            currency: newAccountCurrency,
        };

        try {
            await createAccount(newAccountData);
            router.back();
            if (refreshAccounts) { // Check if refreshAccounts is defined
                refreshAccounts(); // Call the refresh function
                console.log('refreshAccounts');
                
            }
        } catch (error) {
            console.error('Error adding account:', error);
        }
    };

    const showAccountTypePicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', ...accountTypes],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setNewAccountType(accountTypes[buttonIndex - 1].toLowerCase());
                    }
                }
            );
        }
    };

    const showBankPicker = () => {
        if (Platform.OS === 'ios') {
            const options = ['Cancel', ...banks.map(bank => bank.name), 'Add new bank'];
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: options,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        return;
                    } else if (buttonIndex === options.length - 1) {
                        handleBankSelection('add_new');
                    } else {
                        handleBankSelection(banks[buttonIndex - 1].id.toString());
                    }
                }
            );
        }
    };

    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
    const showCurrencyPicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', ...currencies],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex !== 0) {
                        setNewAccountCurrency(currencies[buttonIndex - 1]);
                    }
                }
            );
        }
    };

    const renderPicker = (label: string, value: string, onPress: () => void) => {
        if (Platform.OS === 'ios') {
            return (
                <TouchableOpacity onPress={onPress} style={styles.pickerButton}>
                    <Text style={styles.pickerLabel}>{label}</Text>
                    <Text style={styles.pickerValue}>{value || 'Select'}</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <View>
                    <Text style={styles.pickerLabel}>{label}</Text>
                    <Picker
                        selectedValue={value}
                        onValueChange={onPress}
                        style={styles.picker}
                    >
                        {currencies.map((currency, index) => (
                            <Picker.Item key={index} value={currency} label={currency} />
                        ))}
                    </Picker>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Add New Account</Text>
                <TextInput
                    label="Account Name"
                    mode="outlined"
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                    style={styles.input}
                />
                {renderPicker(
                    'Account Type',
                    newAccountType,
                    Platform.OS === 'ios' ? showAccountTypePicker : (itemValue) => setNewAccountType(itemValue)
                )}
                {! isAddingNewBank && renderPicker(
                    'Bank',
                    selectedBank ? banks.find(bank => bank.id.toString() === selectedBank)?.name : '',
                    Platform.OS === 'ios' ? showBankPicker : handleBankSelection
                )}
                {isAddingNewBank && (
                    <>
                        <TextInput
                            label="New Bank Name"
                            mode="outlined"
                            value={newBankName}
                            onChangeText={setNewBankName}
                            style={styles.input}
                        />
                    </>
                )}
                {renderPicker(
                    'Currency',
                    newAccountCurrency,
                    Platform.OS === 'ios' ? showCurrencyPicker : (itemValue) => setNewAccountCurrency(itemValue)
                )}
                <Button mode="contained" onPress={handleAddAccount} style={styles.button}>
                    Add Account
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: colors.text,
    },
    input: {
        marginBottom: 16,
        backgroundColor: colors.white,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    pickerLabel: {
        fontSize: 16,
        color: colors.lightText,
        marginBottom: 8,
    },
    picker: {
        backgroundColor: colors.white,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.darkGray,
        marginBottom: 16,
    },
    newBankContainer: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: colors.primary,
    },
    pickerButton: {
        backgroundColor: colors.white,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.darkGray,
        padding: 12,
        marginBottom: 16,
    },
    pickerValue: {
        fontSize: 16,
        color: colors.text,
    },
});