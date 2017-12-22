import * as React from "react";
import { View, Text, FlatList, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Portal } from "./Portal";
import { InboxStyle } from "../styles/Inbox";
import {getSeqNumber} from "../utils/Store"
import {navOptions} from "../styles/StyleConf";
import {Filter} from "../actions/documents"

export class Timeline extends React.Component<{ documents: any, navigation: any, readDocumentsFilter: Function }> {
    static navigationOptions = () => {
        return navOptions('Conversation', {
            headerLeft: <Icon name="mail-outline" size={ 30 } />,
            headerRight: <Icon name="mail-outline" size={ 30 } />
        })};

    componentWillMount(){
        this.props.readDocumentsFilter(Filter.Shared);
    }

    renderItem(item) {
        return (
            <TouchableNativeFeedback>
                <View style={InboxStyle.mailRow}>
                    <View>
                        <Text style={InboxStyle.author}>sss</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }

    render() {
        const {documents, navigation } = this.props;

        return (
            <Portal navigation={ navigation }>
                <FlatList
                    data={ documents }
                    keyExtractor={document => getSeqNumber()}
                    renderItem={({ item }) => this.renderItem(item)}
                />
            </Portal>
        );
    }
}