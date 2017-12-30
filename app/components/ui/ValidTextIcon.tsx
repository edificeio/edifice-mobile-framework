import * as React from "react"
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { Disable, NavIcon } from ".."
import { layoutSize } from "../../constants/layoutSize"
import styles from "../styles/index"

function isLoading(isLoadings) {
	if (isLoadings === undefined) return false
	return isLoadings.reduce((acc, elemIsLoading) => acc || elemIsLoading, false)
}

export interface ValidTextIconProps {
	onPress?: (Object) => void
	disabled?: boolean
	fontSize?: number
	isLoadings?: boolean
	leftName?: string
	rightName?: string
	style?: StyleProp<ViewStyle>
	title?: string
	whiteSpace?: string
}

export const ValidTextIcon = ({
	disabled = false,
	fontSize = layoutSize.LAYOUT_10,
	isLoadings = false,
	leftName = "",
	onPress,
	rightName = "",
	style = styles.validButtonStyle,
	title = "",
	whiteSpace = " ",
}: ValidTextIconProps) => {
	const disable = isLoading(isLoadings) || disabled
	const buttonStyle = disable ? styles.validButtonStyleDisabled : style
	return (
		<View style={styles.validButtonStyleWrapper}>
			<TouchableOpacity onPress={onPress} disabled={disable}>
				<Text style={buttonStyle}>
					{leftName.length > 0 && <NavIcon name={leftName} fontSize={fontSize} />}
					{whiteSpace}
					{title}
					{whiteSpace}
					{rightName.length > 0 && <NavIcon name={rightName} fontSize={fontSize} />}
				</Text>
				{disable && <Disable />}
			</TouchableOpacity>
		</View>
	)
}
