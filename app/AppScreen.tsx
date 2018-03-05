import * as React from "react"
import { StatusBar, View } from "react-native"
import SplashScreen from "react-native-smart-splash-screen";
import { CommonStyles } from "./styles/common/styles"
import { AppNavigator } from "./navigation/AppNavigator"
import { Tracking } from "./tracking/TrackingManager"
import ProgressBar from "./ui/ProgressBar";

function getCurrentRoute(navigationState) {
	if (!navigationState) {
		return null
	}
	const route = navigationState.routes[navigationState.index]
	if (route.routes) {
		return getCurrentRoute(route)
	}
	return route
}

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
