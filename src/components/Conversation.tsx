import * as React from "react";
import { View, Text, FlatList, NativeScrollEvent, NativeSyntheticEvent, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from "./Avatar";
import Swipeable from 'react-native-swipeable';
import { Portal } from "./Portal";
import { InboxStyle } from "../styles/Inbox";
import {getSeqNumber} from "../utils/Store"
import {navOptions} from "../styles/StyleConf";
import {AuthProps} from "../model/Auth";
import {NavigationDispatch, NavigationStackAction} from "react-navigation";

const swipeoutBtns = [
    <View style={ InboxStyle.hiddenButtons }><Icon name="notifications-off" size={ 30 } /></View>,
    <View style={ InboxStyle.hiddenButtons }><Icon name="delete" size={ 30 } /></View>
];

export interface ConversationProps {
    inbox: any
    navigation: any
    readConversation: (number) => void
}


export class Conversation extends React.Component< ConversationProps, any> {
    static navigationOptions = () => {
        return navOptions('Conversation', {
            headerLeft: <Icon name="mail-outline" size={ 30 } />,
            headerRight: <Icon name="mail-outline" size={ 30 } />
        })};

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
                    keyExtractor={() => getSeqNumber()}
                    renderItem={({ item }) => this.renderItem(item)}
                    onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                        if (event.nativeEvent.contentOffset.y === 0) {
                            readConversation(inbox.page++)
                        }
                    }}
                />
            </Portal>
        );
    }
}