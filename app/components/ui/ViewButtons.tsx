import * as React from "react"
import { View } from "react-native"
import { ButtonTextIcon } from "./ButtonTextIcon"
import styles from "../styles/index"


export interface ViewButtonsProps {
    onCancel: () => void
    onValid: () => void
    title: string
}

export const ViewButtons = ({ onCancel, onValid, title}: ViewButtonsProps) => (
    <View style={styles.viewButtons}>
        <ButtonTextIcon onPress={() => onValid()} title={title}/>
        <ButtonTextIcon onPress={() => onCancel()} title={"Annuler"}/>
    </View>
)

