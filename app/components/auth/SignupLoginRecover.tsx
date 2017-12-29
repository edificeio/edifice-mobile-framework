import * as React from "react"
import { View } from "react-native"
import { Row } from ".."
import { AuthProps } from "../../model/Auth"
import { Login } from "./Login"
import { RecoverPassword } from "./RecoverPassword"

export interface SignupLoginRecoverProps {
	auth?: AuthProps
	login?: (email: string, password: string) => void
	recoverPassword?: (email) => void
}

export interface SignupLoginRecoverState {
	route: string
}

export class SignupLoginRecover extends React.Component<SignupLoginRecoverProps, SignupLoginRecoverState> {
	public state = {
		route: "login",
	}

	public onRoute(newRoute) {
		this.setState({ route: newRoute })
	}

	public render() {
		const { email, password } = this.props.auth
		const { route } = this.state

		if (email.length > 0 && password.length > 0) {
			return <View>{this.props.children}</View>
		}

		if (route === "login") {
			return <Login onRoute={r => this.onRoute(r)} {...this.props} />
		}
		if (route === "pass") {
			return <RecoverPassword onRoute={r => this.onRoute(r)} {...this.props} />
		}
	}
}
