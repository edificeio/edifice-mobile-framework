import * as React from "react";
import { View, Text, ListView, ListViewDataSource, TouchableHighlight, TouchableNativeFeedback, Button , Image} from 'react-native';
import { Conversation } from './model/Conversation';
import { InboxStyle } from './styles/Inbox';
import { StyleConf, navOptions } from "../StyleConf";
import { me } from "../auth/model/User";
import { Conf } from "../Conf";
import Icon from 'react-native-vector-icons/MaterialIcons';

export class Inbox extends React.Component<{ navigation: any }, { dataSource: ListViewDataSource }> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    static navigationOptions = () => {
        console.log('navoptions');
        console.log(`${ Conf.platform }/userbook/avatar/${ me.userinfo.userId }?thumbnail=100x100`);
        return navOptions('Messages', { 
        headerLeft: <Image source={ { uri: `https://upload.wikimedia.org/wikipedia/commons/3/3a/Bos_grunniens_at_Yundrok_Yumtso_Lake.jpg` }} style={ InboxStyle.avatar } />,
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
                        <TouchableNativeFeedback onPressOut={ () => this.props.navigation.navigate('ReadMail', { id: thread.id, name: thread.author.name }) }>
                            <View>
                                <View style={ InboxStyle.listItem }>
                                    <Text style={ InboxStyle.author }>{ thread.author.name }</Text>
                                    <Text style={ InboxStyle.excerpt } numberOfLines={ 1 } >{ thread.excerpt }</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    )}
                    onEndReached={ () => this.loadNext() }
                />
            </View>
        );
    }
}