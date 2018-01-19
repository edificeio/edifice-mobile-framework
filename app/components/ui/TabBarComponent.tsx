import React from 'react'
import { TabBarBottom } from 'react-navigation'
import {kResponsive} from "./KResponsive";

export interface TabBarBottomKeyboardAward {
    keyboardShow?: boolean
}

class _TabBarBottomKeyboardAward extends React.PureComponent<TabBarBottomKeyboardAward, {}> {

    render() {
        return !this.props.keyboardShow ?
            <TabBarBottom {...this.props} />
            :
            null
    }
}

export const TabBarBottomKeyboardAward = kResponsive(_TabBarBottomKeyboardAward)
