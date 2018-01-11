import * as React from "react"
import { View } from "react-native"

import styles from "../styles"
import { ScrollView } from "./ScrollView"

export const Form = props => (
	<View style={styles.formGrid}>
		<ScrollView showsVerticalScrollIndicator={false}>{props.children}</ScrollView>
	</View>
)
