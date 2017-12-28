import RNFetchBlob from 'react-native-fetch-blob'
import * as React from 'react';
import { Conf } from '../Conf';
import { StyleSheet, Image, View } from 'react-native';

const style = StyleSheet.create({
    avatar: {
        marginLeft: 15, 
        marginRight: 15,
        borderRadius: 25, 
        width: 30, 
        height: 30,
        borderWidth: 1,
        borderColor: 'white'
    }
})

export class Avatar extends React.Component<{ userId: string }, { loaded: boolean }> {
    base64Str: string;

    constructor(props){
        super(props);
        this.state = { loaded: false };
        this.load();
    }

    async load(){
        const response = await RNFetchBlob.fetch('GET', `${ Conf.platform }/userbook/avatar/${ this.props.userId }?thumbnail=48x48`);
        this.base64Str = response.base64();
        this.setState({ loaded: true });
    }
    
    render(){
        if(!this.state.loaded){
            return <View></View>
        }
        return <Image source={ { uri: 'data:image/jpeg;base64,' + this.base64Str }} style={ style.avatar } />
    }
}