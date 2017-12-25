import * as React from 'react'
import { Col } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const FormInput = props => (
    <Col style={styles.inputsPanel}>
            {props.children}
    </Col>
)
