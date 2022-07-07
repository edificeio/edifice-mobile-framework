import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

export const ListItem = ({
  leftElement,
  rightElement,
  style,
}: {
  leftElement?: JSX.Element | null;
  rightElement?: JSX.Element | null;
  style?: ViewStyle;
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: theme.ui.background.card,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: UI_SIZES.spacing.small,
          borderBottomWidth: 1,
          borderBottomColor: theme.ui.border.listItem,
        },
        style,
      ]}>
      {leftElement || null}
      {rightElement || null}
    </View>
  );
};
