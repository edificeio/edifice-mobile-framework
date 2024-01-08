import * as React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.ui.background.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: UI_SIZES.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border.listItem,
  },
});

export const ListItem = ({
  leftElement,
  rightElement,
  style,
}: {
  leftElement?: React.JSX.Element | null;
  rightElement?: React.JSX.Element | null;
  style?: ViewStyle;
}) => {
  return (
    <View style={[styles.container, style]}>
      {leftElement || null}
      {rightElement || null}
    </View>
  );
};
