import * as React from "react"
import { Provider } from "react-redux"
import AppScreen from "./connectors/AppScreen"
import configureStore from "./store"
import { Text } from "react-native"
import { CommonStyles } from "./components/styles/common/styles"

export class AppStore extends React.Component {
	public store = configureStore()

	constructor(props) {
		super(props)
		Text.defaultProps.style = { fontFamily: CommonStyles.primaryFontFamily }
	}

	public render() {
		return (
			<Provider store={this.store}>
				<AppScreen />
			</Provider>
		)
	}
}
