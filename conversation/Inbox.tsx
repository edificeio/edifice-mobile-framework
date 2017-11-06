import * as React from "react";
import { View, Text, ListView, ListViewDataSource, TouchableHighlight, TouchableNativeFeedback } from 'react-native';
import { Conversation } from './model/Conversation';
import { InboxStyle } from './styles/Inbox';

export class Inbox extends React.Component<{ navigation: any }, { dataSource: ListViewDataSource }> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    static navigationOptions = {
        title: 'Inbox',
        headerTintColor: "white"
    }

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
            <View>
                <ListView
                    dataSource={ this.state.dataSource }
                    renderRow={ (thread) => (
                        <TouchableNativeFeedback onPressOut={ () => this.props.navigation.navigate('ReadMail', { id: thread.id, name: thread.author.name }) }>
                        <View style={ InboxStyle.listItem }>
                            <Text style={ InboxStyle.author }>{ thread.author.name }</Text>
                            <Text style={ InboxStyle.excerpt } numberOfLines={ 1 } >{ thread.excerpt }</Text>
                        </View>
                        </TouchableNativeFeedback>
                    )}
                    onEndReached={ () => this.loadNext() }
                />
            </View>
        );
    }
}