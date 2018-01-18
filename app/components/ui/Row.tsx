/* @flow */

import * as React from "react"
import { FlexAlignType } from "react-native"
import styled from "glamorous-native"

const View = styled.View
const TouchableOpacity = styled.TouchableOpacity

export interface RowProperties {
	alignItems?: FlexAlignType
	backgroundColor?: any
	borderBottomColor?: string
	borderBottomWidth?: number
	children?: any
	disabled?: boolean
	height?: any
	justifyContent?: any
	marginLeft?: number
	marginTop?: number
	marginBottom?: number
	paddingBottom?: number,
	paddingTop?: number
	paddingHorizontal?: number
    paddingVertical?: number
	onPress?: (any) => void
	size?: number
	style?: any
	width?: any
}

export interface NewProps {
	flex: number
	flexDirection?: "column" | "row" | "row-reverse" | "column-reverse"
	flexWrap: "wrap" | "nowrap"
}

export const Row = (props: RowProperties) => {
	const { disabled = null, size = null, height = null } = props
	const newProps: NewProps = {
		flex: size ? size : height ? 0 : 1,
		flexDirection: "row",
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
