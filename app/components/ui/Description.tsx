import * as React from 'react'
import { Text } from 'react-native'
import styles from '../styles/index'
import { Row } from '..'

export const Description = props => (
  <Row>
    <Text style={styles.cardDescription} {...props}>
      {props.children}
    </Text>
  </Row>
)
