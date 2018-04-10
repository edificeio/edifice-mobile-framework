import * as React from "react";
import { Provider } from "react-redux";
import { AppScreen } from "./AppScreen";
import { applyMiddleware, createStore } from "redux";
import reducers from "./model";
import { middleware } from "./navigation/middleware";

const enhancer = applyMiddleware(middleware);
const store = createStore(reducers, enhancer);

export class AppStore extends React.Component {
	componentDidMount(){
		store.dispatch({ type: 'CHECK_LOGIN_AUTH' });
	}
	
	public render() {
		return (
			<Provider store={store}>
				<AppScreen />
			</Provider>
		)
	}
}
