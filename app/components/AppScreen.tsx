import * as React from "react"
import { StatusBar, View } from "react-native"
import SplashScreen from "react-native-smart-splash-screen"
import ProgressBar from "../connectors/ui/ProgressBar"
import StatusAlert from "../connectors/ui/StatusAlert"
import { AppNavigator } from "../navigation"
import { CommonStyles } from "./styles/common/styles"

export let navigatorRef

export interface IAppScreenProps {
	checkLogin?: () => void
}

interface IAppScreenState {}

export class AppScreen extends React.Component<IAppScreenProps, IAppScreenState> {
	public navigator: any

	public componentDidMount() {
		navigatorRef = this.navigator
		this.props.checkLogin()
		SplashScreen.close({
			animationType: SplashScreen.animationType.scale,
			delay: 500,
			duration: 850,
		})
	}

	public render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={CommonStyles.statusBarColor} barStyle="light-content" />
				<ProgressBar />
				<StatusAlert />
				<AppNavigator
					ref={nav => {
						this.navigator = nav
					}}
				/>
			</View>
		)
	}
}
