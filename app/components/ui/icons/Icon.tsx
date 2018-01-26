import * as React from "react"
import { createIconSetFromIcoMoon } from "react-native-vector-icons"
import { TextProperties } from "react-native"
const icoMoonConfig = require("../../../../assets/selection.json")

export const Icon = createIconSetFromIcoMoon(icoMoonConfig)

export interface IconProps extends TextProperties {
	color?: any
	focused?: boolean
	name?: string
	size?: number
}
