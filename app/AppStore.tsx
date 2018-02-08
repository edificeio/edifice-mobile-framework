import * as React from "react"
import { Provider } from "react-redux"
import { AppScreen } from "./AppScreen"
import configureStore from "./store"
import { checkLogin } from "./actions/auth"

const store = configureStore()

export class AppStore extends React.Component {
	public componentDidMount() {
		store.dispatch(checkLogin())
	}
	public render() {
		return (
			<Provider store={store}>
				<AppScreen />
			</Provider>
		)
	}
}
