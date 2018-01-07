import * as React from "react"
import {Text} from "react-native"
import Icon, {IconProps} from "./Icon"
import {layoutSize} from "../../../constants/layoutSize"
import {CommonStyles} from "../../styles/common/styles";
// import Icon from "../Icons";


export const IconOnOff = ({focused = false, name, size = layoutSize.LAYOUT_20, ...props}: IconProps) => {
    const imageName = focused ? `${name}-on` : `${name}-off`
    const color = focused ? CommonStyles.iconColorOn : CommonStyles.iconColorOff

    return <Icon name={imageName} color={color} size={size} {...props}/>
}


