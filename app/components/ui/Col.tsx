/* @flow */

import styled from "glamorous-native"
import * as React from "react"
import { FlexAlignType } from "react-native"
import { layoutSize } from "../../constants/layoutSize"

const View = styled.View
const TouchableOpacity = styled.TouchableOpacity

export interface ColProperties {
	alignItems?: FlexAlignType
	backgroundColor?: any
	borderBottomColor?: string
	borderBottomWidth?: number
	disabled?: boolean
	children?: any
	justifyContent?: any
	marginHorizontal?: number
	marginTop?: number
	marginBottom?: number
	padding?: number
	paddingVertical?: number
	pv?: number
	onPress?: (any) => void
	size?: number
	style?: any
	width?: number
}

export interface NewProps {
	alignItems?: any
	flex: number
	flexDirection?: "column" | "row" | "row-reverse" | "column-reverse"
	flexWrap: "wrap" | "nowrap"
	paddingVertical?: number
}

export const Col = (props: ColProperties) => {
	const { size = null, width = null, disabled = null, paddingVertical = null, pv = null } = props
	const newProps: NewProps = {
		flex: size ? size : width ? 0 : 1,
		flexDirection: "column",
		flexWrap: "wrap",
		paddingVertical: pv ? layoutSize.LAYOUT_2 : paddingVertical ? paddingVertical : 0,
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
