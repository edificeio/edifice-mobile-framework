import * as React from "react"
import { TabBarBottom } from "react-navigation"
import { kResponsive } from "./KResponsive"

export interface TabBarBottomKeyboardAward {
	keyboardShow?: boolean
}

class _TabBarBottomKeyboardAward extends React.PureComponent<TabBarBottomKeyboardAward, {}> {
	public render() {
		return this.props.keyboardShow ? null : <TabBarBottom {...this.props} />
	}
}

export const TabBarBottomKeyboardAward = kResponsive(_TabBarBottomKeyboardAward)
