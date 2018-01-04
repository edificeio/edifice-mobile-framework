import * as React from "react"
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import { Disable, IconSmall } from ".."
import { layoutSize } from "../../constants/layoutSize"
import {CommonStyles} from "../styles/common/styles"

const styles = StyleSheet.create( {
    validButtonStyle: {
        alignSelf: "center",
        backgroundColor: CommonStyles.actionColor,
        color: CommonStyles.inverseColor,
        paddingHorizontal: layoutSize.LAYOUT_24,
        paddingVertical: layoutSize.LAYOUT_5,
        borderRadius: layoutSize.LAYOUT_20,
        fontWeight: "500",
    },
    validButtonStyleDisabled: {
        alignSelf: "center",
        backgroundColor: "transparent",
        color: CommonStyles.actionColor,
        paddingHorizontal: layoutSize.LAYOUT_24,
        paddingVertical: layoutSize.LAYOUT_5,
        borderRadius: layoutSize.LAYOUT_20,
        borderColor: "#00B6EAB9",
        borderWidth: 0.7,
        fontWeight: "400",
    },
    validButtonStyleWrapper: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CommonStyles.backgroundColor,
        marginTop: layoutSize.LAYOUT_40,
        marginBottom: layoutSize.LAYOUT_13,
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
