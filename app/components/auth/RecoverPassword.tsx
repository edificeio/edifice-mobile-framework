import * as React from "react"
import { Text } from "react-native"
import { AuthProps } from "../../model/Auth"

import { ERR_INPUT } from "../../constants/errFormInput"

import {
	Col,
	Form,
	FormFooter,
	FormHeader,
	FormInput,
	FormValid,
	Row,
	ScrollView,
	TextInputError,
	ValidTextIcon,
} from ".."

import styles from "../styles"

export interface RecoverPasswordState {
	disabled: boolean
	email: string
}

export interface RecoverPasswordProps {
	auth?: AuthProps
	recoverPassword?: (email: string) => void
	onRoute?: (string) => void
}

export class RecoverPassword extends React.Component<RecoverPasswordProps, RecoverPasswordState> {
	public state = {
		email: "",
		disabled: true,
	}

	public onChange(prop) {
		const { email } = this.state
		this.setState(prop)

		this.setState({ disabled: email.length === 0 })
	}

	public render() {
		const { onRoute, recoverPassword } = this.props
		const { email } = this.state

		return (
			<Form>
				<FormHeader />
				<FormInput>
					<Col style={styles.inputsPanel}>
						<TextInputError
							label="Email"
							keyboardType="email-address"
							errCodes={ERR_INPUT.email}
							value={this.state.email}
							onChange={text => this.onChange({ email: text })}
						/>
					</Col>
				</FormInput>
				<FormValid>
					<Row style={styles.line}>
						<ValidTextIcon
							onPress={e => recoverPassword(email)}
							disabled={this.state.disabled}
							title="Récupérer mot de passe"
						/>
					</Row>
				</FormValid>
				<Col style={styles.linksPanel}>
					<Row style={styles.line} onPress={e => onRoute("signup")}>
						<Text style={styles.text}>
							Pas encore inscrit?
							<Text style={styles.textBoldOverride}> Inscription</Text>
						</Text>
					</Row>
				</Col>
			</Form>
		)
	}
}
