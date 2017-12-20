import * as React from "react";
import { View, Text, ListView, ListViewDataSource, TouchableHighlight, TouchableNativeFeedback, Button , Image} from 'react-native';
import { Conf } from "../Conf";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from "../components/Avatar";
import Swipeable from 'react-native-swipeable';
import { Portal } from "../components/Portal";
import { InboxStyle } from "../styles/Inbox";
import { Conversation } from "../model/Conversation";
import { appModel } from "../model/AppModel";
import { navOptions } from "../styles/StyleConf";

const swipeoutBtns = [
    <View style={ InboxStyle.hiddenButtons }><Icon name="notifications-off" size={ 30 } /></View>,
    <View style={ InboxStyle.hiddenButtons }><Icon name="delete" size={ 30 } /></View>
];

export class Inbox extends React.Component<{ navigation: any }, { appModel: any }> {

    static navigationOptions = () => {
        return navOptions('Messages', { 
        headerLeft: <Avatar userId={ appModel.me.userinfo.userId } />,
        headerRight: <Icon name="mail-outline" size={ 30 } style={ InboxStyle.newMail} />
    })};
    

    constructor(props){
        super(props);
        this.state = { appModel: appModel.plug(this) };
        this.start();
    }

    async loadNext(){
        await appModel.conversation.inbox.loadNext();
    }

    async start(){
        await appModel.conversation.inbox.sync();
    }

    render() {
        return (
            <Portal navigation={ this.props.navigation }>
                <ListView
                    dataSource={ appModel.conversation.inbox.dataSource }
                    renderRow={ (thread) => (
                        <Swipeable rightButtons={swipeoutBtns}>
                            <TouchableNativeFeedback onPress={ () => this.props.navigation.navigate('ReadMail', { id: thread.id, name: thread.author.name }) }>
                                <View style={ InboxStyle.mailRow}>
                                    <Avatar userId={ thread.author.userId } />
                                    <View>
                                        
                                        <Text style={ InboxStyle.author }>{ thread.author.name }</Text>
                                        <Text style={ InboxStyle.excerpt } numberOfLines={ 1 } >{ thread.excerpt }</Text>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </Swipeable>
                        
                    )}
                    onEndReached={ () => this.loadNext() }
                />
            </Portal>
        );
    }
}