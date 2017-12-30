import * as React from "react"
import {View} from "react-native";
import { Row } from ".."
import { AuthProps } from "../../model/Auth"
import { Login } from "./Login"
import { RecoverPassword } from "./RecoverPassword"


export interface SignupLoginRecoverProps {
	auth?: AuthProps
	login?: (email: string, password: string) => void,
	recoverPassword?: (email) => void
}

export interface SignupLoginRecoverState {
	route: string
}

export class SignupLoginRecover extends React.Component<SignupLoginRecoverProps, SignupLoginRecoverState> {
	state = {
		route: "login",
	}

	public onRoute(newRoute) {
		this.setState({ route: newRoute })
	}

	public render() {
		const { synced, loggedIn } = this.props.auth
		const { route} = this.state

		if (synced === false || loggedIn)
			return <View />

		if (route === "login") {
			return <Login onRoute={r => this.onRoute(r)} {...this.props} />
		}
		if (route === "pass") {
			return <RecoverPassword onRoute={r => this.onRoute(r)} {...this.props} />
		}
	}
}
