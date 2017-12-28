import * as React from 'react'
import { Col } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const FormHeader = props => (
    <Col style={styles.inputsPanel}>
            {props.children}
    </Col>
)
