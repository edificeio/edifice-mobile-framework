import * as React from "react";
import { View, TextInput, Button } from 'react-native';
import { LoginFormStyle } from "../styles/LoginForm";
import { me } from "../model/User";

export class Login extends React.Component<{ onLogin: () => void }, undefined> {
    static navigationOptions = {
        title: 'Login'
    }

    constructor(props){
        super(props);
    }

    async login(){
        await me.login();
        if(me.loggedIn){
            this.props.onLogin();
        }
    }

    render() {
        return (
            <View style={ LoginFormStyle.view }>
                <TextInput style={ LoginFormStyle.input } onChangeText={(value) => me.email = value } />
                <TextInput style={ LoginFormStyle.input } onChangeText={(value) => me.password = value } />

                <Button title={ 'Connexion' } onPress={ () => this.login() } />
            </View>
        );
    }
}