import * as React from "react";
import { View, ListView, WebView, ListViewDataSource, Text, ActivityIndicator, TextInput, KeyboardAvoidingView, TouchableHighlight, Image } from 'react-native';
import { Conversation } from './model/Conversation';
import { Thread } from './model/Thread';
import { ReadMailStyle } from './styles/ReadMail';
import { StyleConf, navOptions } from '../StyleConf';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DocFile } from '../workspace/model/Document';

interface ReadMailState{
    newMessage: string,
    html: string,
    imagePath: string;
}

export class ReadMail extends React.Component<{ navigation: any }, ReadMailState> {
    dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    document: DocFile;
    thread: Thread;
    webView: any;

    static navigationOptions = ({ navigation }) => navOptions(navigation.state.params.name);

    constructor(props){
        super(props);
        this.thread = Conversation.inbox.threads.find(t => t.id === props.navigation.state.params.id);
        this.document = new DocFile();
        this.state = {
            newMessage: '',
            html: this.thread.html,
            imagePath: undefined
        };
    }

    async openCamera(){
        await this.document.openCamera();
        this.thread.temporarySendImage(this.document.uri, this.webView);
        this.setState({ html: this.thread.html, imagePath: this.document.uri });
        setTimeout(() => this.document.uploadImage().then(() => this.thread.sendImage(this.document.path)), 50);
    }

    render(){
        return (
            <KeyboardAvoidingView style={ ReadMailStyle.view } keyboardVerticalOffset={ StyleConf.navbarheight }>
                <WebView style={ ReadMailStyle.webview } source={ { html: this.state.html, baseUrl: 'web/' } } ref={(webView) => this.webView = webView} />
                <View style={ ReadMailStyle.inputView }>
                    <TouchableHighlight onPress={ () => this.openCamera() } style={ { backgroundColor: '#fff' } } underlayColor={ '#fff' }>
                        <Icon name="camera" size={ 30 } color={ StyleConf.primary } style={ ReadMailStyle.icon } />
                    </TouchableHighlight>
                    <TextInput underlineColorAndroid="transparent" placeholder="Ecrivez un message..." style={ ReadMailStyle.input } onChangeText={(value) => this.setState({ newMessage: value }) } />
                </View>
            </KeyboardAvoidingView>
        )
    }
}