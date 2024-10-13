import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, KeyboardAvoidingView } from 'react-native';
import Modal from 'react-native-modal';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '@/constants/colors';
import { Account } from '@/types/account';
import { Platform } from 'react-native';

interface SearchableModalProps {
    data: Account[];
    onSelect: (id: number | string) => void; // Allow string for new values
    placeholder: string;
    label: string;
    allowCustomValue?: boolean; // New prop to allow custom values
    searchable?: boolean; // New prop to enable/disable search
}

const SearchableModal: React.FC<SearchableModalProps> = ({ data, onSelect, placeholder, label, allowCustomValue = false, searchable = true }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = searchable
        ? data.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : data;

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <Pressable
                style={styles.input}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.placeholder}>{placeholder}</Text>
            </Pressable>

            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                onSwipeComplete={() => setModalVisible(false)}
                style={styles.modal}
                swipeDirection="down"
                propagateSwipe
            >
                <View style={styles.modalContent}>
                    <KeyboardAvoidingView
                        contentContainerStyle={styles.scrollViewContent}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  >
                        {searchable && (
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                placeholderTextColor={colors.lightText}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        )}
                        <FlatList
                            style={styles.flatList}
                            data={filteredData}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.item}
                                    onPress={() => {
                                        onSelect(item.id);
                                        setModalVisible(false);
                                    }}
                                >
                                    <View style={styles.itemRow}>
                                        <Text style={styles.itemText}>{item.name}</Text>
                                        {item.type !== 'expense' && item.type !== 'income' && (
                                            <Text style={styles.balanceText}>{item.balance.toFixed(2)} €</Text>
                                        )}
                                    </View>
                                </Pressable>
                            )}
                            showsVerticalScrollIndicator={true}
                        />
                        <View style={styles.buttonContainer}>
                            {allowCustomValue && (
                                <Pressable
                                    style={styles.submitButton}
                                    onPress={() => {
                                        onSelect(searchQuery);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.submitButtonText}>Add</Text>
                                </Pressable>
                            )}
                            <Pressable
                                style={[styles.closeButton, !allowCustomValue && styles.centeredButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    input: {
        height: 50,
        borderColor: colors.darkGray,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        justifyContent: 'center',
        backgroundColor: colors.white,
    },
    placeholder: {
        color: colors.lightText,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 16,
        height: '80%',
    },
    searchInput: {
        height: 40,
        borderColor: colors.darkGray,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '100%',
        color: colors.text,
    },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
        width: '100%',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 16,
        color: colors.text,
        marginRight: 16,
    },
    balanceText: {
        fontSize: 16,
        color: colors.darkGray,
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 16,
        padding: 12,
        backgroundColor: colors.secondary,
        borderRadius: 10,
        flex: 1,
        marginRight: 8,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: 16,
        marginBottom: 16,
        padding: 12,
        backgroundColor: colors.primary,
        borderRadius: 10,
        flex: 1,
    },
    closeButtonText: {
        color: colors.white,
        fontSize: 16,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
        marginBottom: Platform.OS === 'ios' ? 16 : 0,
    },
    centeredButton: {
        justifyContent: 'center',
    },
    flatListContainer: {
        maxHeight: 300, // Set a maximum height for the FlatList container
        width: '100%',
    },
    flatList: {
        width: '100%',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});

export default SearchableModal;