import * as React from "react"

import { Animated, EmitterSubscription, Keyboard, Platform } from "react-native"

export interface KComponentState {
	keyboardShow: boolean

}


export const kResponsive = WrappedComponent => {
	return class KComponent extends React.Component<any, KComponentState> {
		public keyboardDidShowListener: EmitterSubscription
		public keyboardDidHideListener: EmitterSubscription

		constructor(props) {
			super(props)

			this.state = {
				keyboardShow: false
			}
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
			this.setState( {keyboardShow: true})
		}

		public keyboardWillHide = () => {
            this.setState( {keyboardShow: false})
		}

		render() {
			return <WrappedComponent {...this.props} keyboardShow={this.state.keyboardShow} />
		}
	}
}
