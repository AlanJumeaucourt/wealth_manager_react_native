import { StyleSheet } from 'react-native';

const sharedStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    body: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        height: '100%',
    },
});

export default sharedStyles;