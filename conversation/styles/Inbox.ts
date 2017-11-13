import { StyleSheet } from 'react-native';

export const InboxStyle = StyleSheet.create({
    listItem: {
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    author: {
        fontWeight: 'bold'
    },
    excerpt: {
        flexDirection: 'row'
    },
    avatar: {
        marginLeft: 15, 
        borderRadius: 25, 
        width: 30, 
        height: 30,
        borderWidth: 1,
        borderColor: 'white'
    },
    newMail: {
        color: 'white',
        paddingRight: 15
    }
})