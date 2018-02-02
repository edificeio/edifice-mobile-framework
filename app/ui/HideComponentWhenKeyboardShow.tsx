import * as React from "react"
import { TabBarBottom } from "react-navigation"
import { KeyboardInjection } from "./KeyboardInjection"
import { EmitterSubscription } from "react-native"

export interface TabBarBottomKeyboardAward {
	keyboardShow?: boolean
}

export const HideComponentWhenKeyboardShow = WrappedComponent => {
	return class _HideComponentWhenKeyboardShow extends React.PureComponent<any, {}> {
		public render() {
			return this.props.keyboardShow ? null : <WrappedComponent {...this.props} />
		}
	}
}

export const TabBarBottomKeyboardAward = KeyboardInjection(HideComponentWhenKeyboardShow(TabBarBottom))
