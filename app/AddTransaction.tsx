import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { createTransaction } from './api/bankApi'; // Import your API function
import { Transaction } from '../types/transaction';

type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

const AddTransaction = () => {
    const route = useRoute<AddTransactionRouteProp>();
    const { transaction } = route.params || {}; // Get the transaction object if it exists

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense', // Default type
    });

    // Effect to prefill fields if editing
    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount.toString(),
                type: transaction.type,
            });
        }
    }, [transaction]);

    const handleChange = (name: string, value: string) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const transactionData = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                type: formData.type,
                // Add other necessary fields here
            };
            await createTransaction(transactionData); // Call the create transaction API
            Alert.alert('Success', 'Transaction created successfully!');
            // Navigate back or reset form
        } catch (error) {
            console.error('Error creating transaction:', error);
            Alert.alert('Error', 'Failed to create transaction.');
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Description"
                value={formData.description}
                onChangeText={value => handleChange('description', value)}
            />
            <TextInput
                placeholder="Amount"
                value={formData.amount}
                onChangeText={value => handleChange('amount', value)}
                keyboardType="numeric"
            />
            <Button title="Save" onPress={handleSubmit} />
        </View>
    );
};

export default AddTransaction;