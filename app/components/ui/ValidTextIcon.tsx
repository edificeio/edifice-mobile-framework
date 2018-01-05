import * as React from "react"
import {StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from "react-native"
import { Disable, IconSmall } from ".."
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "../styles/common/styles"

const validButtonStyleLayout = {
    borderColor: CommonStyles.actionColor,
    borderRadius: layoutSize.LAYOUT_34,
    borderWidth: 0.9,
    fontSize: layoutSize.LAYOUT_14,
    paddingHorizontal: layoutSize.LAYOUT_36,
    paddingVertical: layoutSize.LAYOUT_8,
}

interface Style {
    validButtonStyle: TextStyle,
    validButtonStyleDisabled: TextStyle,
    validButtonStyleWrapper: ViewStyle
}

const styles = StyleSheet.create<Style>( {
    validButtonStyle: {
        ...validButtonStyleLayout,
        backgroundColor: CommonStyles.actionColor,
        color: CommonStyles.inverseColor,
    },
    validButtonStyleDisabled: {
        ...validButtonStyleLayout,
        backgroundColor: "transparent",
        color: CommonStyles.actionColor,
        fontSize: layoutSize.LAYOUT_14,
    },
    validButtonStyleWrapper: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CommonStyles.backgroundColor,
        marginTop: layoutSize.LAYOUT_50,
        marginBottom: layoutSize.LAYOUT_16,
        overflow: 'hidden',
		height: layoutSize.LAYOUT_40,
    },
})

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
                    {leftName.length > 0 && <IconSmall name={leftName}/>}
					{whiteSpace}
					{title}
					{whiteSpace}
                    {rightName.length > 0 && <IconSmall name={rightName}/>}
				</Text>
				{disable && <Disable />}
			</TouchableOpacity>
		</View>
	)
}
