import * as React from 'react'
import { Col, Row } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const FormValid = props => (
    <Col style={styles.buttonPanel}>
        <Row style={styles.line}>
            {props.children}
        </Row>
    </Col>
)
