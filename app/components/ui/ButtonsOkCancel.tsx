import * as React from "react"
import { View } from "react-native"
import { ButtonTextIcon } from "./ButtonTextIcon"
import { layoutSize } from "../../constants/layoutSize"
import g from "glamorous-native"

export interface ButtonsOkCancelProps {
	onCancel: () => void
	onValid: () => void
	title: string
}

const ButtonStyled = g.view({
	flexDirection: "row",
	flex: 0,
	marginTop: layoutSize.LAYOUT_28,
	height: layoutSize.LAYOUT_20,
	justifyContent: "center",
})

export const ButtonsOkCancel= ({ onCancel, onValid, title }: ButtonsOkCancelProps) => (
	<ButtonStyled>
		<ButtonTextIcon onPress={() => onValid()} title={title} />
		<ButtonTextIcon onPress={() => onCancel()} title={"Annuler"} />
	</ButtonStyled>
)
