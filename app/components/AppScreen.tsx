import * as React from "react"
import { StatusBar, View } from "react-native"
import SplashScreen from "react-native-smart-splash-screen"
import ProgressBar from "../connectors/ui/ProgressBar"
import StatusAlert from "../connectors/ui/StatusAlert"
import AppNavigator from "../navigation"
import { CommonStyles } from "./styles/common/styles"

export interface AppScreenProps {
	checkLogin?: () => void
}

interface AppScreenState {}

export class AppScreen extends React.Component<AppScreenProps, AppScreenState> {
	public navigator: any

	public componentDidMount() {
		this.props.checkLogin()
		SplashScreen.close({
			animationType: SplashScreen.animationType.scale,
			duration: 850,
			delay: 500,
		})
	}

	public render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={CommonStyles.statusBarColor} barStyle="light-content" />
				<ProgressBar />
				<StatusAlert />
				<AppNavigator />
			</View>
		)
	}
}
