/* @flow */

import * as React from 'react'
import { TouchableOpacity, View, ViewProperties } from 'react-native'
import { computeProps } from './Utils/computeProps'

type State = {
};

export interface ColProperties extends ViewProperties  {
    marginTop?: number
    onPress?: (any) => void
    size?: number
    style?: any
    width?: number
};

export class Col extends React.Component< ColProperties, State >  {

  prepareRootProps() {
    var type = {
      flexDirection: 'column',
      flex: this.props.size ? this.props.size : this.props.style && this.props.style.width ? 0 : 1,
    }

    var defaultProps = {
      style: type,
    }
    return computeProps(this.props, defaultProps)
  }

  render() {
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
