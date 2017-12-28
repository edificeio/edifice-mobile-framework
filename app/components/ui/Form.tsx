import * as React from 'react'
import { Col, ScrollView } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const Form = props => (
    <Col style={styles.grid}>
        <ScrollView showsVerticalScrollIndicator={false}>
            {props.children}
        </ScrollView>
    </Col>
)
