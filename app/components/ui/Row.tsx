/* @flow */

import * as React from "react"
import { FlexAlignType } from "react-native"
import glamorous from "glamorous-native"

const View = glamorous.View
const TouchableOpacity = glamorous.TouchableOpacity

export interface RowProperties {
	alignItems?: FlexAlignType
	backgroundColor?: any
	borderBottomColor?: string
	borderBottomWidth?: number
	children?: any
	height?: any
	justifyContent?: any
	marginTop?: number
	marginBottom?: number
	onPress?: (any) => void
	size?: number
	style?: any
}

export interface NewProps {
	flex: number
	flexDirection?: "column" | "row" | "row-reverse" | "column-reverse"
	flexWrap: "wrap" | "nowrap"
}

export const Row = (props: RowProperties) => {
	const { size = null, height = null } = props
	const newProps: NewProps = {
		flex: size ? size : height ? 0 : 1,
		flexDirection: "row",
		flexWrap: "wrap",
	}

	if (props.onPress) {
		return (
			<TouchableOpacity onPress={props.onPress}>
				<View {...props} {...newProps}>
					{props.children}
				</View>
			</TouchableOpacity>
		)
	} else {
		return <View {...props} {...newProps} />
	}
}
