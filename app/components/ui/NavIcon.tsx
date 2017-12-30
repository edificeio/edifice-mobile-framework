import * as React from "react"
import FontAwesomeIcons from "react-native-vector-icons/FontAwesome"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import { layoutSize } from "../../constants/layoutSize"

export const FontAwesomeIcon = ({ name, size = layoutSize.LAYOUT_13, color = "black", ...props }) => (
	<FontAwesomeIcons name={name} size={size} color={color} {...props} />
)

export const SimpleLineIcon = ({ name, size = layoutSize.LAYOUT_12, color = "white", ...props }) => (
	<SimpleLineIcons name={name} size={size} color={color} {...props} />
)

export interface NavIconProps {
	tintColor?: string
	name: string
	fontSize?: number | string
}

export const NavIcon = ({ tintColor = "white", name, fontSize = layoutSize.LAYOUT_18, ...props }: NavIconProps) => (
	<MaterialCommunityIcons style={{ color: tintColor, fontSize }} name={name} {...props} />
)

export const NavSmallIcon = ({ tintColor = "black", name, ...props }: NavIconProps) => (
	<NavIcon tintColor={tintColor} name={name} fontSize={layoutSize.LAYOUT_12} {...props} />
)
