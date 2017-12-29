import * as React from "react"
import { Text } from "react-native"
import { Row } from ".."
import styles from "../styles/index"

export const Description = props => (
	<Row>
		<Text style={styles.cardDescription} {...props}>
			{props.children}
		</Text>
	</Row>
)
