import * as React from 'react'
import { Col } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const FormFooter = props => (
    <Col style={styles.linksPanel}>
            {props.children}
    </Col>
)
