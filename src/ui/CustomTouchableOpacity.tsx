import * as React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

/**
 * A simple <TouchableOpacity> component, but with a default prop on it.
 */

export default class CustomTouchableOpacity extends React.Component<TouchableOpacityProps> {
  render() {
    return <TouchableOpacity delayPressIn={50} {...this.props} />;
  }
}
