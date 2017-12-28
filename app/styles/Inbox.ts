import { StyleSheet } from 'react-native';

export const InboxStyle = StyleSheet.create({
    mailRow: {
        padding: 10,
        paddingLeft: 0,
        paddingRight: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row'
    },
    author: {
        fontWeight: 'bold'
    },
    excerpt: {
        flexDirection: 'row'
    },
    newMail: {
        color: 'white',
        paddingRight: 15
    },
    hiddenButtons: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 75
    }
})