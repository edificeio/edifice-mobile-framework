import * as React from "react"
import { AuthState } from "../../model/Auth"

import { ERR_INPUT } from "../../constants/errFormInput"

import { Form, TextInputError, ValidTextIcon } from ".."

export interface RecoverPasswordState {
	disabled: boolean
	email: string
}

export interface RecoverPasswordProps {
	auth?: AuthState
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
		const { recoverPassword } = this.props
		const { email } = this.state

		return (
			<Form>
				<TextInputError
					label="Email"
					keyboardType="email-address"
					errCodes={ERR_INPUT.email}
					value={this.state.email}
					onChange={text => this.onChange({ email: text })}
				/>
				<ValidTextIcon
					onPress={() => recoverPassword(email)}
					disabled={this.state.disabled}
					title="Récupérer mot de passe"
				/>
			</Form>
		)
	}
}
