import * as React from "react"
import { Provider } from "react-redux"
import { AppScreen } from "./AppScreen"
import configureStore from "./store"
import { checkLogin } from "./actions/auth"

const store = configureStore()
store.dispatch(checkLogin())

export class AppStore extends React.Component {
	public render() {
		return (
			<Provider store={store}>
				<AppScreen />
			</Provider>
		)
	}
}
