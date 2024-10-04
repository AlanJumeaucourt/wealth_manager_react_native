import React from 'react';
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Alert, StyleSheet, Platform } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from '@react-navigation/native';

interface DeleteButtonProps {
    deleteText: string;
    deleteTextAlert: string;
    deleteFunction: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ deleteText, deleteTextAlert, deleteFunction }) => {
    const navigation = useNavigation();

    const handleDelete = () => {
        Alert.alert(
            "Confirm Deletion",
            deleteTextAlert,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => {
                        deleteFunction();
                        Alert.alert("Deletion Status", "Deletion successful.", [
                            {
                                text: "OK",
                            }
                        ]);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="red" />
            <Text style={styles.deleteButtonText}>{deleteText}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    deleteButton: {
        marginLeft: 2,
        marginTop: Platform.OS === 'ios' ? 20 : 0,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    deleteButtonText: {
        marginRight: 8,
        color: 'red',
        marginLeft: 8,
    },
});