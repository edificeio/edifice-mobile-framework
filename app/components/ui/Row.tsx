/* @flow */

import * as React from 'react'
import {TouchableOpacity, View, ViewProperties} from 'react-native'

import { computeProps } from './Utils/computeProps'


export interface RowProperties extends ViewProperties {
    children: any
    height?: number
    marginTop?: number
    marginBottom?: number
    minHeight?: number
    onPress?: (any) => void
    size?: number
    style?: any
    width?: number
};


export class Row extends React.Component< RowProperties, any >  {

  prepareRootProps() {
    const type = {
      flexDirection: 'row',
      flex: this.props.size ? this.props.size : this.props.style && this.props.style.height ? 0 : 1,
      flexWrap: 'wrap',
    }

    const defaultProps = {
      style: type,
    }
    return computeProps(this.props, defaultProps)
  }

  render() {
    const { style, onPress, ...nextProps } = this.props
    if (onPress) {
      return (
        <View style={style}>
            <TouchableOpacity onPress={onPress}>
              <View {...nextProps} {...this.prepareRootProps()}>
                {this.props.children}
              </View>
            </TouchableOpacity>
        </View>
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
