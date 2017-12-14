import * as React from "react";
import { View, Text, ListView, ListViewDataSource, TouchableHighlight, TouchableNativeFeedback, Button , Image} from 'react-native';
import { Conversation } from './model/Conversation';
import { InboxStyle } from './styles/Inbox';
import { StyleConf, navOptions } from "../StyleConf";
import { me } from "../auth/model/User";
import { Conf } from "../Conf";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from "../components/Avatar";
import Swipeable from 'react-native-swipeable';
import { Portal } from "../components/Portal";

const swipeoutBtns = [
    <View style={ InboxStyle.hiddenButtons }><Icon name="notifications-off" size={ 30 } /></View>,
    <View style={ InboxStyle.hiddenButtons }><Icon name="delete" size={ 30 } /></View>
];

export class Inbox extends React.Component<{ navigation: any }, { dataSource: ListViewDataSource }> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    static navigationOptions = () => {
        return navOptions('Messages', { 
        headerLeft: <Avatar userId={ me.userinfo.userId } />,
        headerRight: <Icon name="mail-outline" size={ 30 } style={ InboxStyle.newMail} />
    })};
    

    constructor(props){
        super(props);
        this.state = {
            dataSource: this.dataSource.cloneWithRows([])
        };
        this.start();
    }

    async loadNext(){
        if(!Conversation.inbox.lastPage){
            await Conversation.inbox.sync();
            this.setState({
                dataSource: this.dataSource.cloneWithRows(Conversation.inbox.threads)
            });
        }
    }

    async start(){
        await Conversation.inbox.sync();
        this.setState({
            dataSource: this.dataSource.cloneWithRows(Conversation.inbox.threads)
        });
    }

    render() {
        return (
            <Portal navigation={ this.props.navigation }>
                <ListView
                    dataSource={ this.state.dataSource }
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