import React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default function NavBarActionsGroup(props: { elements: React.ReactNode[] }) {
  const styles = StyleSheet.create({
    container: {
      width: props.elements.length * UI_SIZES.dimensions.width.hug + (props.elements.length - 1) * UI_SIZES.spacing.tiny,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
  return <View style={styles.container}>{props.elements.map(element => element)}</View>;
}
