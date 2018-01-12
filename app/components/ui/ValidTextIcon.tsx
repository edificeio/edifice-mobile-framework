import * as React from "react"
import { Animated, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native"
import glamorous from "glamorous-native"
import { Disable, IconSmall } from ".."
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"
import { kResponsive } from "./KResponsive"

const View = glamorous.View

const validButtonStyleLayout = {
	borderRadius: layoutSize.LAYOUT_14 * 3.8,
	fontFamily: CommonStyles.primaryFontFamilySemibold,
	fontSize: layoutSize.LAYOUT_14,
	paddingHorizontal: layoutSize.LAYOUT_36,
	paddingVertical: layoutSize.LAYOUT_10,
}

const styles = StyleSheet.create<Style>({
	validButtonStyle: {
		...validButtonStyleLayout,
		backgroundColor: CommonStyles.actionColor,
		color: CommonStyles.inverseColor,
		textAlignVertical: "center",
	},
	validButtonStyleDisabled: {
		...validButtonStyleLayout,
		backgroundColor: CommonStyles.backgroundColor,
		borderColor: CommonStyles.actionColor,
		borderWidth: layoutSize.LAYOUT_1,
		color: CommonStyles.actionColor,
		textAlignVertical: "center",
	},
	validButtonStyleWrapper: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: CommonStyles.backgroundColor,
		height: layoutSize.LAYOUT_40,
		marginBottom: layoutSize.LAYOUT_20,
	},
})

const marginTopLargeWrapper = layoutSize.LAYOUT_60
const marginTopSmallWrapper = layoutSize.LAYOUT_40

interface Style {
	validButtonStyle: TextStyle
	validButtonStyleDisabled: TextStyle
	validButtonStyleWrapper: ViewStyle
}

function isSynced(synced) {
	if (synced === undefined) return true
	return synced.reduce((acc, elemIsSync) => acc || elemIsSync, false)
}

export interface ValidTextIconProps {
	disabled?: boolean
	fontSize?: number
	leftName?: string
	onPress?: any
	rightName?: string
	style?: any
	synced?: boolean[]
	title?: string
	whiteSpace?: string,
    keyboardShow?: boolean
}

export interface State {
	marginTop: any
}

const _ValidTextIcon = ({
	disabled = false,
	leftName = "",
	keyboardShow,
	onPress,
	rightName = "",
	style = styles.validButtonStyle,
	synced = true,
	title = "",
	whiteSpace = " ",
}: ValidTextIconProps) => {
	const disable = !isSynced(synced) || disabled
	const buttonStyle = disable ? styles.validButtonStyleDisabled : style

	return (
		<View style={styles.validButtonStyleWrapper} marginTop={keyboardShow ?  layoutSize.LAYOUT_36 : layoutSize.LAYOUT_60}>
			<TouchableOpacity onPress={onPress} disabled={disable}>
				<Text style={buttonStyle}>
					{leftName.length > 0 && <IconSmall name={leftName} />}
					{whiteSpace}
					{title}
					{whiteSpace}
					{rightName.length > 0 && <IconSmall name={rightName} />}
				</Text>
				{disable && <Disable />}
			</TouchableOpacity>
		</View>
	)
}

export const ValidTextIcon = kResponsive(_ValidTextIcon)
