import * as React from "react";
import { View, Text, ListView, ListViewDataSource, TouchableHighlight, TouchableNativeFeedback, Button , Image} from 'react-native';
import { Conversation } from './model/Conversation';
import { InboxStyle } from './styles/Inbox';
import { StyleConf, navOptions } from "../StyleConf";
import { me } from "../auth/model/User";
import { Conf } from "../Conf";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Avatar } from "../components/Avatar";
import Swipeout from 'react-native-swipeout';

var swipeoutBtns = [
    {
        component:  <View style={ InboxStyle.hiddenButtons }><Icon name="notifications-off" size={ 30 } /></View>,
        backgroundColor: "#eeeeee"
    },
    {
        component:  <View style={ InboxStyle.hiddenButtons }><Icon name="delete" size={ 30 } /></View>,
        backgroundColor: StyleConf.accent
    }

  ]

export class Inbox extends React.Component<{ navigation: any }, { dataSource: ListViewDataSource }> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    static navigationOptions = () => {
        console.log('navoptions');
        console.log(`${ Conf.platform }/userbook/avatar/${ me.userinfo.userId }?thumbnail=100x100`);
        return navOptions('Messages', { 
        headerLeft: <Avatar userId={ me.userinfo.userId } />,
        headerRight: <Icon name="mail-outline" size={ 30 } style={ InboxStyle.newMail} />
    })};
    

    constructor(props){
        super(props);
        console.log(Inbox.navigationOptions);
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
            <View>
                <ListView
                    dataSource={ this.state.dataSource }
                    renderRow={ (thread) => (
                        <Swipeout right={swipeoutBtns}>
                            <TouchableNativeFeedback onPress={ () => this.props.navigation.navigate('ReadMail', { id: thread.id, name: thread.author.name }) }>
                            <View style={ InboxStyle.mailRow}>
                                <Avatar userId={ thread.author.userId } />
                                <View>
                                    
                                    <Text style={ InboxStyle.author }>{ thread.author.name }</Text>
                                    <Text style={ InboxStyle.excerpt } numberOfLines={ 1 } >{ thread.excerpt }</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                      </Swipeout>
                        
                    )}
                    onEndReached={ () => this.loadNext() }
                />
                <View>
                    
                </View>
            </View>
        );
    }
}