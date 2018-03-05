import style from "glamorous-native"
import * as React from "react"
import { Disable, Row, RowProperties } from "./index"
import { CommonStyles } from "../styles/common/styles"
import { Icon } from "./icons/Icon"
import { KeyboardInjection } from "./KeyboardInjection"
import { connect } from "react-redux";

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
			marginTop={keyboardShow ? 36 : 60}
			onPress={() => onPress()}
			disabled={disabled}
		>
			<ButtonStyle disabled={disable}>
				<TextStyle disabled={disable}>
					{leftName.length > 0 && <Icon name={leftName} />}
					{whiteSpace}
					{title}
					{whiteSpace}
					{rightName.length > 0 && <Icon name={rightName} />}
				</TextStyle>
			</ButtonStyle>
			{disable && <Disable />}
		</ValidStyle>
	)
}

export const ValidTextIcon = KeyboardInjection(_ValidTextIcon)

const ValidStyle = (props: RowProperties) => (
	<Row
		alignItems="center"
		justifyContent="center"
		backgroundColor={CommonStyles.lightGrey}
		height={38}
		marginBottom={20}
		marginTop={0}
		{...props}
	/>
)

const ButtonStyle = style.view(
	{
		borderRadius: 38 * 0.5,
		paddingHorizontal: 36,
		paddingVertical: 9,
	},
	({ disabled }) => ({
		backgroundColor: disabled ? CommonStyles.lightGrey : CommonStyles.actionColor,
		borderColor: disabled ? CommonStyles.actionColor : CommonStyles.lightGrey,
		borderWidth: disabled ? 1 : 0,
	})
)

const TextStyle = style.text(
	{
		fontFamily: CommonStyles.primaryFontFamilySemibold,
		fontSize: 14,
		textAlignVertical: "center",
	},
	({ disabled }) => ({
		color: disabled ? CommonStyles.actionColor : CommonStyles.inverseColor,
	})
)

const isSynced = (synced: boolean[]) => {
	if (synced === undefined) {
		return true
	}
	return synced.reduce((acc, elemIsSync) => acc || elemIsSync, false)
}

const mapStateToProps = state => ({
	synced: [state.auth.synced],
})

export default connect<{}, {}, ValidTextIconProps>(mapStateToProps)(ValidTextIcon)