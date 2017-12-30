/* @flow */

import * as React from "react"
import { TouchableOpacity, View, ViewProperties } from "react-native"

import { computeProps } from "./Utils/computeProps"

export interface RowProperties extends ViewProperties {
    alignItems?: string
	children: any,
    height?: number
    justifyContent?: string
    marginTop?: number
    marginBottom?: number
	onPress?: (any) => void
	size?: number
	style?: any
}

export class Row extends React.Component<RowProperties, any> {
	public calculateStyle() : any {
	    const { size, height, justifyContent, alignItems, marginTop, marginBottom} = this.props
		const type = {
            alignItems: alignItems ? alignItems : null,
			flex: size ? size : height || (height) ? 0 : 1,
			flexDirection: "row",
			flexWrap: "wrap",
            height: height ? height : null,
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
	    const { alignItems, height, justifyContent, marginTop, marginBottom, size, style, ...nextProps} = this.props
        if (this.props.onPress) {
            return (
                <TouchableOpacity onPress={this.props.onPress}>
                    <View
                        {...nextProps}
                        {...this.calculateStyle()}
                    >{this.props.children}</View>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <View
                    {...nextProps}
                    {...this.calculateStyle()}
                >{this.props.children}</View>
            );
        }
    }
}
