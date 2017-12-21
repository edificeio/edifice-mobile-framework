import  { Component } from 'react'
import * as React from 'react';
import { StackNavigator } from 'react-navigation';
import { StyleSheet, ActivityIndicator, } from 'react-native';
import Conversation from '../connectors/Conversation';
import ReadMail from '../connectors/ReadMail';
import { Timeline } from './Timeline';
import { StyleConf } from '../styles/StyleConf';
import { Login } from './Login';


const mainStyle = StyleSheet.create({
    spinner: {
        flex: 1,
        height: '100%',
        width: '100%'
    }
})

const AppNavigator = StackNavigator({
        Inbox: { screen: Conversation },
        ReadMail: { screen: ReadMail },
        Timeline: { screen: Timeline }
    },
    {
        headerMode: 'screen'
    } as any);


export class App extends Component< { auth: any, login: (email: string, password: string) => void }, {}> {

    render() {
        const { loggedIn, synced} = this.props.auth

        if(!synced){
            console.log('spinner')
            return <ActivityIndicator size={ 250 } color={ StyleConf.primary } style={ mainStyle.spinner } />
        }
        if(!loggedIn){
            return <Login onLogin={this.props.login}/>
        }
        return (
            <AppNavigator style={ { backgroundColor: StyleConf.primary} } />
        );
    }
}
