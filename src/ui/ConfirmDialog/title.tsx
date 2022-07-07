import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { layoutSize } from '~/styles/common/layoutSize';

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    fontSize: layoutSize.LAYOUT_16,
    marginBottom: UI_SIZES.spacing.minor,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-end',
  },
});

export default class DialogTitle extends React.PureComponent<{ style?: TextStyle }> {
  static displayName = 'DialogTitle';

  render() {
    const { children, style } = this.props;

    if (Array.isArray(children)) {
      return <View style={[styles.container, style]}>{children}</View>;
    } else if (typeof children === 'string') {
      return <Text style={[styles.text, style]}>{children}</Text>;
    }
  }
}
