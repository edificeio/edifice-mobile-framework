import * as React from 'react'
import { ScrollView } from 'react-native'
import { Row } from '..'

import {styles}  from '../auth/AuthScreensStyles'

export const Form = props => (
    <Row style={styles.grid}>
        <ScrollView>
            {props.children}
        </ScrollView>
    </Row>
)
