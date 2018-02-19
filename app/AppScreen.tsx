import * as React from "react"
import { StatusBar, View } from "react-native"
import SplashScreen from "react-native-smart-splash-screen"
import ProgressBar from "./connectors/ui/ProgressBar"
import StatusAlert from "./connectors/ui/StatusAlert"
import { CommonStyles } from "./styles/common/styles"
import { AppNavigator } from "./navigation/AppNavigator"
import { getCurrentRoute } from "./navigation"
import { Tracking } from "./tracking/TrackingManager"


export interface IAppScreenProps {}

interface IAppScreenState {}

export let navigationRef = null

export class AppScreen extends React.Component<IAppScreenProps, IAppScreenState> {
	navigator: any

	public componentDidMount() {
		navigationRef = this.navigator;
		SplashScreen.close({
			animationType: SplashScreen.animationType.scale,
			delay: 500,
			duration: 850,
		});
	}

	setNavigator(nav){
		this.navigator = nav;
	}

	public render() {
		return (
			<View style={{ flex: 1 }}>
				<StatusBar backgroundColor={CommonStyles.statusBarColor} barStyle="light-content" />
				<ProgressBar />
				<StatusAlert />
				<AppNavigator
					onNavigationStateChange={(prevState, currentState) => {
						const currentRoute = getCurrentRoute(currentState)
						const prevRoute = getCurrentRoute(prevState)

						if (prevRoute.routeName !== currentRoute.routeName) {
							Tracking.trackScreenView(currentRoute.routeName, currentRoute.params)
						}
					}}
					ref={nav => this.setNavigator(nav)}
				/>
			</View>
		)
	}
}
