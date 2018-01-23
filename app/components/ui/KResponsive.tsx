import * as React from "react"

import { EmitterSubscription, Keyboard, Platform } from "react-native"

export interface KComponentState {
	keyboardShow: boolean
}

export const kResponsive = WrappedComponent => {
	return class KComponent extends React.Component<any, KComponentState> {
		public keyboardDidShowListener: EmitterSubscription
		public keyboardDidHideListener: EmitterSubscription
		public state = {
			keyboardShow: false,
		}

		public componentDidMount() {
			const name = Platform.OS === "ios" ? "Will" : "Did"
			this.keyboardDidShowListener = Keyboard.addListener(`keyboard${name}Show`, () => this.keyboardWillShow())
			this.keyboardDidHideListener = Keyboard.addListener(`keyboard${name}Hide`, () => this.keyboardWillHide())
		}

		public componentWillUnmount() {
			this.keyboardDidShowListener.remove()
			this.keyboardDidHideListener.remove()
		}

		public keyboardWillShow = () => {
			if (!this.state.keyboardShow) {
				this.setState({ keyboardShow: true })
			}
		}

		public keyboardWillHide = () => {
			if (this.state.keyboardShow) {
				this.setState({ keyboardShow: false })
			}
		}

		public render() {
			return <WrappedComponent {...this.props} keyboardShow={this.state.keyboardShow} />
		}
	}
}
