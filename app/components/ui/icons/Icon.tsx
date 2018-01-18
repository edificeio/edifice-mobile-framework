import { createIconSetFromIcoMoon } from "react-native-vector-icons"
const icoMoonConfig = require("../../../../assets/fonts/selection.json")
export const Icon = createIconSetFromIcoMoon(icoMoonConfig)

export interface IconProps {
	color?: any
	focused?: boolean
	name?: string
	size?: number
}
