import * as React from 'react'
import { Text } from 'react-native'

import styles  from './LabelStyle'

export const Label = props => (
  <Text style={props.style ? props.style : styles.label}>{props.children}</Text>
)
