import style from "glamorous-native"
import * as React from "react"
import { Text, TouchableOpacity } from "react-native"
import styles from "../styles"
import { Icon } from "./icons/Icon"
import { CommonStyles } from "../styles/common/styles";

export interface ButtonTextIconProps {
	onPress: () => any
	disabled?: boolean
	leftName?: string
	rightName?: string
	title: string
	whiteSpace?: string
}

const ButtonText = style.text({
	backgroundColor: "transparent",
	color: CommonStyles.actionColor,
	fontWeight: "400",
	paddingHorizontal: 15,
	textAlign: 'center',
	textAlignVertical: 'center'
});

const ButtonContainer = style.touchableOpacity({
	justifyContent: 'center',
	alignItems: 'center'
});

export const ButtonTextIcon = ({
	onPress,
	disabled = false,
	title,
	leftName = "",
	rightName = "",
	whiteSpace = " ",
}: ButtonTextIconProps) => {
	return (
		<ButtonContainer onPress={onPress} disabled={disabled}>
			<ButtonText>
				{leftName.length > 0 && <Icon name={leftName} />}
				{whiteSpace}
				{title}
				{whiteSpace}
				{rightName.length > 0 && <Icon name={rightName} />}
			</ButtonText>
		</ButtonContainer>
	)
}
