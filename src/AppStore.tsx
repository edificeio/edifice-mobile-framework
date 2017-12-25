import * as React from 'react';
import { Provider } from 'react-redux'
import App from './connectors/App'
import configureStore from './store'

export class AppStore extends React.Component {
    store = configureStore()

    render() {
        return (
            <Provider store={this.store}>
                <App />
            </Provider>
        )
    }
}
