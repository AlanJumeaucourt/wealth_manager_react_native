import { Animated } from "react-native";
import { Text } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useRef } from "react";

export const TopPopUp = ({ popupMessage }: { popupMessage: string }) => {
    const popupAnim = useRef(new Animated.Value(0)).current;
    return (
        <Animated.View style={[styles.popup, { transform: [{ translateY: popupAnim }] }]}>
            <Text style={styles.popupText}>{popupMessage}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    popup: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 20,
        zIndex: 1000,
    },
    popupText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
