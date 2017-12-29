import * as React from "react"
import { StatusBar, Text } from "react-native"
import SplashScreen from "react-native-smart-splash-screen"
import { addNavigationHelpers, NavigationDispatch, NavigationStackAction } from "react-navigation"
import { Col } from "."
import SignupLoginRecover from "../connectors/auth/SignupLoginRecover"
import ProgressBar from "../connectors/ui/ProgressBar"
import StatusAlert from "../connectors/ui/StatusAlert"
import { AuthProps } from "../model/Auth"
import AppNavigator from "../navigation"
import { CommonStyles } from "./styles/common/styles"

export interface AppProps {
	auth?: AuthProps
	dispatch?: (any) => any
    initNavigationState?: (Object) => any,
	navigation?: NavigationDispatch<NavigationStackAction>
}

export class App extends React.Component<AppProps, any> {
	public componentDidMount() {
		SplashScreen.close({
			animationType: SplashScreen.animationType.scale,
			duration: 850,
			delay: 500,
		})
        Text.defaultProps.style = { fontFamily: 'OpenSans' }
        this.props.initNavigationState(this.props.navigation) // pour avoir un state redux contenant une navigation
	}

	public renderBody() {
		const { auth } = this.props
		const { loggedIn } = auth

		if (!loggedIn) {
			return <SignupLoginRecover />
		}
		return (
			<AppNavigator />
		)
	}

	public render() {
		return (
			<Col flex={1}>
				<StatusBar backgroundColor={CommonStyles.mainColorTheme} barStyle="light-content" />
				<ProgressBar />
				<StatusAlert />
				{this.renderBody()}
			</Col>
		)
	}
}
