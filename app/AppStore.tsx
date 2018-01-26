import * as React from "react"
import { Text } from "react-native"
import { Provider } from "react-redux"
import { CommonStyles } from "./components/styles/common/styles"
import AppScreen from "./connectors/AppScreen"
import configureStore from "./store"
import "./tools/firebase"

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
