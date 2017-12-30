import * as React from "react"
import { StatusBar, Text } from "react-native"
import SplashScreen from "react-native-smart-splash-screen"
import { Col } from "."
import ProgressBar from "../connectors/ui/ProgressBar"
import StatusAlert from "../connectors/ui/StatusAlert"
import {AppNavigator} from "../navigation"
import { CommonStyles } from "./styles/common/styles"

export let navigatorRef;

export interface AppScreenProps {
   checkLogin?: () => void
}

interface AppScreenState {
}

export class AppScreen extends React.Component<AppScreenProps, AppScreenState> {
	navigator: any

    componentDidMount() {
        navigatorRef = this.navigator;
        this.props.checkLogin()
        SplashScreen.close({
            animationType: SplashScreen.animationType.scale,
            duration: 850,
            delay: 500,
        })
    }

    render() {
        return (
			<Col size={1}>
				<StatusBar backgroundColor={CommonStyles.mainColorTheme} barStyle="light-content" />
				<ProgressBar />
				<StatusAlert />
				<AppNavigator ref={nav => { this.navigator = nav; }}/>
			</Col>
		)
	}
}
