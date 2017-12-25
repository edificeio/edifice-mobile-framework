import * as React from "react";
import {Text} from 'react-native'

import { Form, FormHeader, FormInput, FormFooter, FormValid, Row, TextInputError, ValidTextIcon} from '..'
import {AuthProps} from '../../model/Auth'

import {styles} from './AuthScreensStyles'

export interface LoginState {
    route: string
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
            route: 'Login',
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
                <FormInput>
                    <TextInputError
                        label="Email"
                        value={email}
                        onChange={username => this.onChange({username})}
                    />
                    <TextInputError
                        label="Mot de passe"
                        secureTextEntry
                        value={password}
                        onChange={password => this.onChange({password})}
                    />
                </FormInput>
                <FormValid>
                    <ValidTextIcon
                        onPress={e => login(email, password)}
                        disabled={this.state.disabled}
                        title="Connexion"
                    />
                </FormValid>
                <FormFooter>
                    <Row style={styles.line} onPress={e => onRoute('pass')}>
                        <Text style={styles.text}>Mot de passe oublié?</Text>
                    </Row>
                </FormFooter>
            </Form>
        )
    }
}

