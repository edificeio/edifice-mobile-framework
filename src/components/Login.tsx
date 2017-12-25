import * as React from "react";
import { View, TextInput, Button } from 'react-native';
import { LoginFormStyle } from "../styles/LoginForm";


export class Login extends React.Component<{ onLogin: ( email: string, password: string) => void }, { email: string, password: string} > {
    static navigationOptions = {
        title: 'Login'
    }

    constructor(props){
        super(props);

        this.state = {
            email: '',
            password: '',
        }
    }

    onChange(val) {
        this.setState((prevState) => ({ ...prevState, ...val }))
    }

    render() {
        const {email, password} = this.state
        return (
            <View style={ LoginFormStyle.view }>
                <TextInput style={ LoginFormStyle.input } onChangeText={(email) => this.onChange({email})} />
                <TextInput style={ LoginFormStyle.input } onChangeText={(password) => this.onChange( {password})} />

                <Button title={ 'Connexion' } onPress={ () => this.props.onLogin( email, password) } />
            </View>
        );
    }
}