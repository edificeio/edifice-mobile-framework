import * as React from "react"
import { Col, ScrollView } from ".."

import styles from "../styles"

export const Form = props => (
	<Col style={styles.formGrid}>
		<ScrollView showsVerticalScrollIndicator={false}>{props.children}</ScrollView>
	</Col>
)
