import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, ScrollView, View, Platform, TouchableOpacity, Animated, Pressable } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { createBank, createAccount } from './api/bankApi';
import { Bank } from '@/types/bank';
import { ActionSheetIOS } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBanks } from '../actions/bankActions';
import { fetchAccounts } from '../actions/accountActions';
import { colors } from '../constants/colors';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SafeViewAndroid from "./components/SafeViewAndroid";
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from './components/BackButton';
import { DeleteButton } from './components/DeleteButton'; // Ensure this import is present
import { deleteBank } from './api/bankApi';
import { AddButton } from './components/AddButton'; // Ensure this import is present


type RootStackParamList = {
    Accounts: undefined;
    AddAccount: undefined;
};

type AddAccountScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddAccount'>;

export default function AddAccountScreen() {
    const navigation = useNavigation<AddAccountScreenNavigationProp>();
    const dispatch = useDispatch();
    const { banks, banksLoading, banksError } = useSelector((state: any) => state.banks);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [newAccountCurrency, setNewAccountCurrency] = useState('');
    const [newBankName, setNewBankName] = useState('');
    const [isAddingNewBank, setIsAddingNewBank] = useState(false);

    const accountTypes = ['Checking', 'Savings', 'Investment'];
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
            dispatch(fetchAccounts());
            navigation.goBack();
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
            const options = ['Cancel', ...banks.map((bank: Bank) => bank.name), 'Add new bank'];
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

    const renderPicker = (label: string, value: string, pickerWidth: number = 100, onPress: () => void) => {
        const pickerStyle = StyleSheet.create({
            pickerContainer: {
                marginBottom: 16,
            },
            pickerButton: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.darkGray,
                width: `${pickerWidth}%`,
            },
            pickerLabel: {
                fontSize: 16,
                color: colors.lightText,
            },
            pickerValue: {
                fontSize: 16,
                color: colors.text,
            },
            picker: {
                backgroundColor: colors.white,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.darkGray,
                marginBottom: 16,
            },

        })

        if (Platform.OS === 'ios') {
            return (
                <TouchableOpacity onPress={onPress} style={pickerStyle.pickerButton}>
                    <Text style={pickerStyle.pickerLabel}>
                        {value ? value : `Select ${label}`}
                    </Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <View>
                    <Text style={pickerStyle.pickerLabel}>{label}</Text>
                    <Picker
                        selectedValue={value}
                        onValueChange={onPress}
                        style={pickerStyle.picker}
                    >
                        {currencies.map((currency, index) => (
                            <Picker.Item key={index} value={currency} label={currency} />
                        ))}
                    </Picker>
                </View>
            );
        }
    };

    const handleDeleteBank = async (bankId: number) => {
        try {
            await deleteBank(bankId); // Ensure this returns a promise
            dispatch(fetchBanks());
            setSelectedBank('');
        } catch (error) {
            console.error('Error deleting bank:', error);
            throw error; // Rethrow the error to be caught in DeleteButton
        }
    };

    const handleAddBank = async () => {
        if (!newBankName) {
            console.error('Please enter a bank name');
            return;
        }

        try {
            await createBank(newBankName);
            dispatch(fetchBanks());
            setNewBankName(''); // Clear the input after adding
            setIsAddingNewBank(false);
        } catch (error) {
            console.error('Error adding bank:', error);
        }
    };

    return (
        <View style={styles.container}>
            <BackButton />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Add New Account</Text>
                <Text style={styles.label}>Account Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter account name"
                    placeholderTextColor={colors.lightText}
                    value={newAccountName}
                    onChangeText={setNewAccountName}
                />

                <Text style={styles.label}>Account Type</Text>
                {renderPicker(
                    'Account Type',
                    newAccountType,
                    100,
                    Platform.OS === 'ios' ? showAccountTypePicker : (itemValue) => setNewAccountType(itemValue)
                )}

                <Text style={styles.label}>Bank</Text>
                {!isAddingNewBank && (
                    <View style={styles.bankSelectionContainer}>
                        {renderPicker(
                            'Bank',
                            selectedBank ? banks.find((bank: Bank) => bank.id.toString() === selectedBank)?.name : '',
                            selectedBank != '' ? 85 : 100,
                            Platform.OS === 'ios' ? showBankPicker : handleBankSelection
                        )}
                        <View style={styles.deleteButtonContainer}>
                            <DeleteButton
                                deleteText=""
                                deleteTextAlert="Are you sure you want to delete this bank?"
                                deleteFunction={() => handleDeleteBank(parseInt(selectedBank))} // This should return a promise
                            />
                        </View>
                    </View>
                )}
                {isAddingNewBank && (
                    <View style={styles.bankSelectionContainer}>
                        <TextInput
                            style={[styles.input, { width: '85%' }]}
                            placeholder="Enter new bank name"
                            placeholderTextColor={colors.lightText}
                            value={newBankName}
                            onChangeText={setNewBankName}
                        />
                        <View style={styles.addButtonContainer}>
                            <AddButton
                                addText=""
                                addTextAlert="Are you sure you want to add this bank?"
                                addFunction={handleAddBank}
                            />
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Currency</Text>
                {renderPicker(
                    'Currency',
                    newAccountCurrency,
                    100,
                    Platform.OS === 'ios' ? showCurrencyPicker : (itemValue) => setNewAccountCurrency(itemValue)
                )}

                <Button mode="contained" onPress={handleAddAccount} style={styles.button}>
                    Add Account
                </Button>
                <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.closeButton}>
                    Close
                </Button>
            </ScrollView>
        </View>
    );
}

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
    label: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    input: {
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
    button: {
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: colors.primary,
    },
    closeButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    bankSelectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteButtonContainer: {
        width: '15%',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    addButtonContainer: {
        width: '15%', // Set the width to 15%
        alignItems: 'flex-end', // Align the button to the right
        justifyContent: 'center', // Center the button vertically
    },
    deleteButton: {
        padding: 5,
    },
});