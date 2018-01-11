import * as React from "react"
import { StyleSheet, View } from "react-native"
import { ButtonTextIcon } from "./ButtonTextIcon"
import { layoutSize } from "../../constants/layoutSize"

export interface ViewButtonsProps {
	onCancel: () => void
	onValid: () => void
	title: string
}

const styles = StyleSheet.create({
	viewButtons: {
		flexDirection: "row",
		flex: 0,
		marginTop: layoutSize.LAYOUT_20,
		height: layoutSize.LAYOUT_20,
		justifyContent: "center",
	},
})

export const ViewButtons = ({ onCancel, onValid, title }: ViewButtonsProps) => (
	<View style={styles.viewButtons}>
		<ButtonTextIcon onPress={() => onValid()} title={title} />
		<ButtonTextIcon onPress={() => onCancel()} title={"Annuler"} />
	</View>
)
