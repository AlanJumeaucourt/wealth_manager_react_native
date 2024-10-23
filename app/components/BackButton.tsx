import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { StyleSheet, Platform } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";

export const BackButton = () => {
    const navigation = useNavigation();

    return (
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" type="ionicon" color="#007AFF" size={24} />
            <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
    );
};


const styles = StyleSheet.create({
    backButton: {
        marginLeft: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        marginLeft: 5,
        fontSize: 18,
        color: '#007AFF',
    },
});