import * as React from "react"
import {KeyboardAvoidingView, Text, View} from "react-native"
import { Col, Form, Logo, TextInputError, ValidTextIcon } from "../index"
import { AuthProps } from "../../model/Auth"
import {navigate} from "../../utils/navHelper";

import styles from "../styles"

export interface LoginState {
	email: string
	password: string
}

export interface LoginProps {
	auth?: AuthProps
	login?: (email: string, password: string) => void
	onRoute?: (route: string) => void
}

export class Login extends React.Component<LoginProps, LoginState> {
	state = {
		email: this.props.auth.email || '',
		password: ''
	}

	public isDisabled() {
		const {email, password} = this.state

		return email.length === 0 || password.length === 0
    }


	public render() {
		const { login } = this.props
		const { email, password } = this.state

		return (
			<Form>
				<KeyboardAvoidingView behavior="padding">
					<Logo />

					<TextInputError label="Identifiant" value={email} onChange={email => this.setState({ email })} />

					<TextInputError
						label="Mot de passe"
						secureTextEntry
						value={password}
						onChange={password => this.setState({ password })}
					/>

					<ValidTextIcon onPress={e => login(email, password)} disabled={this.isDisabled()} title="Se connecter" />

					<Col size={1} style={styles.line} onPress={e => navigate("RecoverPassword")}>
						<Text style={styles.minitext}>Mot de passe oublié?</Text>
					</Col>
                </KeyboardAvoidingView>
			</Form>
		)
	}
}
