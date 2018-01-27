import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../../constants/layoutSize"
import { Disable, Row, RowProperties } from "../index"
import { CommonStyles } from "../styles/common/styles"
import { Icon } from "./icons/Icon"
import { kResponsive } from "./KResponsive"

const ValidStyle = (props: RowProperties) => (
	<Row
		alignItems="center"
		justifyContent="center"
		backgroundColor={CommonStyles.backgroundColor}
		height={layoutSize.LAYOUT_38}
		marginBottom={layoutSize.LAYOUT_20}
		marginTop={layoutSize.LAYOUT_0}
		{...props}
	/>
)

const TextStyle = style.text(
	{
		borderRadius: layoutSize.LAYOUT_14 * 3.8,
		fontFamily: CommonStyles.primaryFontFamilySemibold,
		fontSize: layoutSize.LAYOUT_14,
		paddingHorizontal: layoutSize.LAYOUT_36,
		paddingVertical: layoutSize.LAYOUT_9,
		textAlignVertical: "center",
	},
	({ disabled }) => ({
		backgroundColor: disabled ? CommonStyles.backgroundColor : CommonStyles.actionColor,
		borderColor: disabled ? CommonStyles.actionColor : CommonStyles.backgroundColor,
		borderWidth: disabled ? layoutSize.LAYOUT_1 : 0,
		color: disabled ? CommonStyles.actionColor : CommonStyles.inverseColor,
	})
)

const isSynced = (synced: boolean[]) => {
	if (synced === undefined) {
		return true
	}
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
	whiteSpace?: string
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
	synced = [],
	title = "",
	whiteSpace = " ",
}: ValidTextIconProps) => {
	const disable = !isSynced(synced) || disabled

	return (
		<ValidStyle
			marginTop={keyboardShow ? layoutSize.LAYOUT_36 : layoutSize.LAYOUT_60}
			onPress={() => onPress()}
			disabled={disabled}
		>
			<TextStyle disabled={disable}>
				{leftName.length > 0 && <Icon name={leftName} />}
				{whiteSpace}
				{title}
				{whiteSpace}
				{rightName.length > 0 && <Icon name={rightName} />}
			</TextStyle>
			{disable && <Disable />}
		</ValidStyle>
	)
}

export const ValidTextIcon = kResponsive(_ValidTextIcon)
