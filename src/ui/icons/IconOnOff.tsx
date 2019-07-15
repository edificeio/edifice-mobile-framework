import * as React from "react"
import { CommonStyles } from "../../styles/common/styles"
import { Icon, IconProps } from "./Icon"

export const IconOnOff = ({ focused = false, name, size = 22, ...props }: IconProps) => {
	const imageName = focused ? `${name}-on` : `${name}-off`
	const color = focused ? CommonStyles.iconColorOn : CommonStyles.iconColorOff

	return <Icon name={imageName} color={color} size={size} {...props} />
}
