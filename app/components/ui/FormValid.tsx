import * as React from "react"
import { Col, Row } from ".."

import styles from "../styles"

export const FormValid = props => (
	<Col style={styles.buttonPanel}>
		<Row style={styles.line}>{props.children}</Row>
	</Col>
)
