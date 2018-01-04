/* @flow */

import * as React from "react"
import { TouchableOpacity, View, ViewProperties } from "react-native"
import { computeProps } from "./Utils/computeProps"

interface State {}

export interface ColProperties extends ViewProperties {
    alignItems?: string
    backgroundColor?: any
    borderBottomColor?: string
    borderBottomWidth?: number
    children: any,
    justifyContent?: string
    marginTop?: number
    marginBottom?: number
    onPress?: (any) => void
    size?: number
    style?: any,
    width?: number
}

export class Col extends React.Component<ColProperties, State> {
	public prepareRootProps() {
        const { size, borderBottomColor, borderBottomWidth, width, justifyContent, alignItems, marginTop, marginBottom} = this.props
        const type = {
            alignItems: alignItems ? alignItems : null,
            borderBottomColor: borderBottomColor ? borderBottomColor: null,
            borderBottomWidth: borderBottomWidth ? borderBottomWidth: null,
            flex: size ? size : width ? 0 : 1,
            flexDirection: "column",
            flexWrap: "wrap",
            width: width ? width : null,
            justifyContent: justifyContent ? justifyContent : null,
            marginTop: marginTop ? marginTop : null,
            marginBottom: marginBottom ? marginBottom : null,
        }

        const defaultProps = {
            style: type,
        }
        return computeProps(this.props, defaultProps)
	}

	public render() {
		if (this.props.onPress) {
			return (
				<TouchableOpacity onPress={this.props.onPress}>
					<View {...this.props} {...this.prepareRootProps()}>
						{this.props.children}
					</View>
				</TouchableOpacity>
			)
		} else {
			return (
				<View {...this.props} {...this.prepareRootProps()}>
					{this.props.children}
				</View>
			)
		}
	}
}
