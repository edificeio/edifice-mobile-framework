import * as React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { UI_SIZES } from './constants';

import theme from '~/app/theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderBottomColor: theme.ui.border.listItem,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: UI_SIZES.spacing.small,
  },
});

export const ListItem = ({
  leftElement,
  rightElement,
  style,
  testID,
}: {
  leftElement?: React.JSX.Element | null;
  rightElement?: React.JSX.Element | null;
  style?: ViewStyle;
  testID?: string;
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {leftElement || null}
      {rightElement || null}
    </View>
  );
};
