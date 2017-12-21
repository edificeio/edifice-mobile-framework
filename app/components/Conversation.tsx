import * as React from "react";
import { View, Text, FlatList, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from "./Avatar";
import Swipeable from 'react-native-swipeable';
import { Portal } from "./Portal";
import { InboxStyle } from "../styles/Inbox";
import {getSeqNumber} from "../utils/Store"

const swipeoutBtns = [
    <View style={ InboxStyle.hiddenButtons }><Icon name="notifications-off" size={ 30 } /></View>,
    <View style={ InboxStyle.hiddenButtons }><Icon name="delete" size={ 30 } /></View>
];

export class Conversation extends React.Component<{ inbox: any, navigation: any, readConversation: Function }> {

    componentWillMount(){
        this.props.readConversation(0);
    }

    renderItem({ author, excerpt, id}) {
        return (
            <Swipeable rightButtons={swipeoutBtns}>
                <TouchableNativeFeedback
                    onPress={() => this.props.navigation.navigate('ReadMail', { id, name: author.name})}>
                    <View style={InboxStyle.mailRow}>
                        <Avatar userId={author.userId}/>
                        <View>
                            <Text style={InboxStyle.author}>{author.name}</Text>
                            <Text style={InboxStyle.excerpt} numberOfLines={1}>{excerpt}</Text>
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </Swipeable>
        )
    }

    render() {
        const {inbox, navigation, readConversation } = this.props;

        return (
            <Portal navigation={ navigation }>
                <FlatList
                    data={ inbox.threads }
                    keyExtractor={item => getSeqNumber()}
                    renderItem={({ item }) => this.renderItem(item)}
                    onScroll={({ nativeEvent }) => {
                        if (nativeEvent.contentOffset.y === 0) {
                            readConversation(inbox.page++)
                        }
                    }}
                />
            </Portal>
        );
    }
}