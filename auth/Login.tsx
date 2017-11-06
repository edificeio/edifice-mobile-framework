import * as React from "react";
import { View, TextInput, Button } from 'react-native';
import { me } from './model/User';
import { LoginFormStyle } from './styles/LoginForm';

export class Login extends React.Component<{ onLogin: () => void }> {
    static navigationOptions = {
        title: 'Login'
    }

    constructor(props){
        super(props);
    }

    async login(){
        await me.login();
        console.log(this.props.onLogin)
        this.props.onLogin();
    }

    render() {
        return (
            <View>
                <TextInput style={ LoginFormStyle.input } onChangeText={(value) => me.email = value } />
                <TextInput style={ LoginFormStyle.input } onChangeText={(value) => me.password = value } />

                <Button title={ 'Connexion' } onPress={ () => this.login() } />
            </View>
        );
    }
}