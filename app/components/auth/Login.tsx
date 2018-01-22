import * as React from "react"
import { Text } from "react-native"
import { tr } from "../../i18n/t"
import { AuthModel } from "../../model/Auth"
import { navigate } from "../../utils/navHelper"
import { Col, Form, Logo, ValidTextIcon } from "../index"
import TextInputError from "../../connectors/ui/TextInputError"
import { ERR_INPUT } from "../../constants/errFormInput"

import styles from "../styles"

export interface LoginState {
	email: string
	password: string
}

export interface LoginProps {
	auth?: AuthModel
	login?: (email: string, password: string) => void
	onRoute?: (route: string) => void
}

export class Login extends React.Component<LoginProps, LoginState> {
	state = {
		email: this.props.auth.email || "",
		password: "",
	}

	isDisabled() {
		const { email, password } = this.state

		return email.length === 0 || password.length === 0
	}

	render() {
		const { login } = this.props
		const { email, password } = this.state

		return (
			<Form>
				<Logo />

				<TextInputError
					errCodes={ERR_INPUT.login}
					globalErr={true}
					label={tr.Identifiant}
					onChange={email => this.setState({ email })}
					value={email}
				/>

				<TextInputError
					errCodes={ERR_INPUT.login}
					globalErr={true}
					label={tr.Mot_de_passe}
					onChange={password => this.setState({ password })}
					secureTextEntry
					value={password}
					showErr={true}
				/>

				<ValidTextIcon onPress={() => login(email, password)} disabled={this.isDisabled()} title={tr.Se_connecter} />

				<Col size={1} style={styles.line} onPress={() => navigate("RecoverPassword")}>
					<Text style={styles.minitext}>{tr.Mot_de_passe_oublie}</Text>
				</Col>
			</Form>
		)
	}
}
