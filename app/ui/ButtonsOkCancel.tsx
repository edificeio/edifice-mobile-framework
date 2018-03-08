import styled from "glamorous-native"
import * as React from "react";
import { ButtonTextIcon } from "./ButtonTextIcon"
import {tr} from "../i18n/t";

export interface ButtonsOkCancelProps {
	onCancel: () => void
	onValid: () => void
	title: string
}

const ButtonStyled = styled.view({
	flexDirection: "row",
	flex: 0,
	marginTop: 28,
	height: 20,
	justifyContent: "center",
})

export const ButtonsOkCancel = ({ onCancel, onValid, title }: ButtonsOkCancelProps) => (
	<ButtonStyled>
		<ButtonTextIcon onPress={() => onValid()} title={title} />
		<ButtonTextIcon onPress={() => onCancel()} title={tr.Cancel} />
	</ButtonStyled>
)
