import styled from "glamorous-native"
import * as React from "react";
import { ButtonTextIcon } from "./ButtonTextIcon"
import I18n from 'react-native-i18n';

export interface ButtonsOkCancelProps {
	onCancel: () => void
	onValid: () => void
	title: string
}

const ButtonStyled = styled.view({
	flexDirection: "row",
	width: '100%',
	height: 80,
	justifyContent: "center",
	paddingBottom: 10
})

export const ButtonsOkCancel = ({ onCancel, onValid, title }: ButtonsOkCancelProps) => (
	<ButtonStyled>
		<ButtonTextIcon onPress={() => onValid()} title={title} />
		<ButtonTextIcon onPress={() => onCancel()} title={ I18n.t("Cancel") } />
	</ButtonStyled>
)
