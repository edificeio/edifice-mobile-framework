import * as React from "react"

import { EmitterSubscription, Keyboard, Platform } from "react-native"

export interface KComponentState {
	keyboardShow: boolean
}

export const kResponsive = WrappedComponent => {
	return class KComponent extends React.Component<any, KComponentState> {
		keyboardDidShowListener: EmitterSubscription
		keyboardDidHideListener: EmitterSubscription
		state = {
			keyboardShow: false,
		}

		componentDidMount() {
			const name = Platform.OS === "ios" ? "Will" : "Did"
			this.keyboardDidShowListener = Keyboard.addListener(`keyboard${name}Show`, () => this.keyboardWillShow())
			this.keyboardDidHideListener = Keyboard.addListener(`keyboard${name}Hide`, () => this.keyboardWillHide())
		}

		componentWillUnmount() {
			this.keyboardDidShowListener.remove()
			this.keyboardDidHideListener.remove()
		}

		keyboardWillShow = () => {
			if (!this.state.keyboardShow) {
				this.setState({ keyboardShow: true })
			}
		}

		keyboardWillHide = () => {
			if (this.state.keyboardShow) {
				this.setState({ keyboardShow: false })
			}
		}

		render() {
			return <WrappedComponent {...this.props} keyboardShow={this.state.keyboardShow} />
		}
	}
}
