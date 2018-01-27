import * as React from "react"
import { View } from "react-native"
import { IAuthModel } from "../../model/Auth"
import { Login } from "./Login"
import { RecoverPassword } from "./RecoverPassword"

export interface ISignupLoginRecoverProps {
	auth?: IAuthModel
	login?: (email: string, password: string) => void
	navigation?: any
	recoverPassword?: (email) => void
}

export class SignupLoginRecover extends React.Component<ISignupLoginRecoverProps, any> {
	public render() {
		const { synced, loggedIn } = this.props.auth
		const { routeName } = this.props.navigation.state

		if (synced === false || loggedIn) {
			return <View />
		}

		if (routeName === "Login") {
			return <Login {...this.props} />
		}

		if (routeName === "RecoverPassword") {
			return <RecoverPassword {...this.props} />
		}
		return <View />
	}
}
