import * as React from "react"
import { Text } from "react-native"
import { Provider } from "react-redux"
import { CommonStyles } from "./components/styles/common/styles"
import AppScreen from "./connectors/AppScreen"
import configureStore from "./store"

export class AppStore extends React.Component {
	store = configureStore()

	constructor(props) {
		super(props)
		Text.defaultProps.style = { fontFamily: CommonStyles.primaryFontFamily }
	}

	render() {
		return (
			<Provider store={this.store}>
				<AppScreen />
			</Provider>
		)
	}
}
