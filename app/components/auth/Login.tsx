import * as React from "react";
import {Text, KeyboardAvoidingView, View} from 'react-native'

import { Col, Form, FormHeader, FormInput, FormFooter, FormValid, Logo, Row, TextInputError, ValidTextIcon} from '..'
import {AuthProps} from '../../model/Auth'

import {styles} from './AuthScreensStyles'


export interface LoginState {
    disabled: boolean
    email: string
    password: string
};

export interface LoginProps {
    auth?: AuthProps
    login?: ( email: string, password: string) => void
    onRoute?: (route: string) => void
};

export class Login extends React.Component< LoginProps, LoginState> {

    constructor(props) {
        super(props)
        const {email = '', password = ''} = this.props.auth

        this.state = {
            disabled : email.length === 0 || password.length === 0,
            email : '',
            password : '',
        }
    }

    onChange(prop) {
        this.setState(prop)
        this.setState({disabled: this.state.email.length === 0 || this.state.password.length === 0})
    }

    render() {
        const {login, onRoute} = this.props
        const {email, password} = this.state

        return (
            <Form>
                <KeyboardAvoidingView behavior="padding">

                    <Logo />

                    <TextInputError
                        label="Identifiant..."
                        value={email}
                        onChange={email => this.onChange({email})}
                    />

                    <TextInputError
                        label="Mot de passe..."
                        secureTextEntry
                        value={password}
                        onChange={password => this.onChange({password})}
                    />

                    <ValidTextIcon
                        onPress={e => login(email, password)}
                        disabled={this.state.disabled}
                        title="Se connecter"
                    />


                    <Col size={1} style={styles.line} onPress={e => onRoute('pass')}>
                        <Text style={styles.minitext}>Mot de passe oublié?</Text>
                    </Col>
                </KeyboardAvoidingView>

            </Form>
        )
    }
}

