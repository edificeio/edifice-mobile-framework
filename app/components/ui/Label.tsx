import * as React from "react"
import { Text } from "react-native"

import { StyleSheet } from "react-native"

import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

const styles = StyleSheet.create({
    label: {
        margin: layoutSize.LAYOUT_5,
        padding: layoutSize.LAYOUT_3,
        fontFamily: CommonStyles.primaryFontFamily,
        fontSize: layoutSize.LAYOUT_6,
        lineHeight: layoutSize.LAYOUT_9,
        fontWeight: "300",
        color: CommonStyles.textTabBottomColor,
        backgroundColor: CommonStyles.backgroundColor,
        shadowColor: CommonStyles.shadowColor,
        shadowOffset: CommonStyles.shadowOffset,
        shadowRadius: CommonStyles.shadowRadius,
        shadowOpacity: CommonStyles.shadowOpacity,
        elevation: CommonStyles.elevation,
        alignSelf: "stretch",
    },
})


export const Label = props => <Text style={props.style ? props.style : styles.label}>{props.children}</Text>
