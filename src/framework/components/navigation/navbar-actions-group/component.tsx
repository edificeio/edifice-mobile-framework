import React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default function NavBarActionsGroup(props: { elements: React.ReactNode[] }) {
  return (
    <View
      style={[
        styles.container,
        { width: props.elements.length * UI_SIZES.dimensions.width.hug + (props.elements.length - 1) * UI_SIZES.spacing.tiny },
      ]}>
      {props.elements.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </View>
  );
}
