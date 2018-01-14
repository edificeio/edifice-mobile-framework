/* @flow */

import * as React from "react"
import { FlexAlignType } from "react-native"
import glamorous from "glamorous-native"
import { CommonStyles } from "../styles/common/styles"
import { layoutSize } from "../../constants/layoutSize"

const View = glamorous.View
const TouchableOpacity = glamorous.TouchableOpacity

export interface ColProperties {
	alignItems?: FlexAlignType
	backgroundColor?: any
	borderBottomColor?: string
	borderBottomWidth?: number
	disabled?: boolean
	children?: any
	justifyContent?: any
	marginTop?: number
	marginBottom?: number
	paddingVertical?: number
	onPress?: (any) => void
	size?: number
	style?: any
	width?: number
}

export interface NewProps {
	flex: number
	flexDirection?: "column" | "row" | "row-reverse" | "column-reverse"
	flexWrap: "wrap" | "nowrap"
}

export const Col = (props: ColProperties) => {
	const { size = null, width = null, disabled = null } = props
	const newProps: NewProps = {
		flex: size ? size : width ? 0 : 1,
		flexDirection: "column",
		flexWrap: "wrap",
	}

	if (props.onPress) {
		return (
			<TouchableOpacity onPress={props.onPress} disabled={disabled}>
				<View {...props} {...newProps}>
					{props.children}
				</View>
			</TouchableOpacity>
		)
	} else {
		return <View {...props} {...newProps} />
	}
}
