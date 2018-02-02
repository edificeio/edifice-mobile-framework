import * as React from "react"
import { Text } from "react-native"
import { Provider } from "react-redux"
import { CommonStyles } from "./styles/common/styles"
import AppScreen from "./connectors/AppScreen"
import configureStore from "./store"
import TrackingManager from "./tracking"
import "./tools/firebase"

const store = configureStore()
TrackingManager.init(store)

export class AppStore extends React.Component {
	constructor(props) {
		super(props)
		Text.defaultProps.style = { fontFamily: CommonStyles.primaryFontFamily }
	}

	public render() {
		return (
			<Provider store={store}>
				<AppScreen />
			</Provider>
		)
	}
}
