import * as React from "react"
import { Text } from "react-native"
import styles from "../styles/index"

export const Title = props => <Text style={props.style ? props.style : styles.cardTitle}>{props.children}</Text>
