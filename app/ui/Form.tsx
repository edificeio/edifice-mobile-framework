import * as React from "react"
import { View, ScrollView } from "react-native"

import styles from "../styles";

export const Form = props => (
	<View style={styles.formGrid}>
		<ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{props.children}</ScrollView>
	</View>
)
