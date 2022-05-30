import * as React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { LoadingIndicator } from './loading';
import { Picture } from './picture';

export interface RoundButtonProps {
  iconName: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const RoundButton = ({ iconName, action, disabled, loading }: RoundButtonProps) => {
  const color = disabled ? theme.palette.grey.grey : theme.palette.primary.regular;
  const backgroundColor = disabled ? theme.palette.grey.pearl : theme.palette.primary.pale;
  return (
    <TouchableOpacity
      onPress={action}
      disabled={disabled || loading}
      style={[RoundButton.styles.touchableOpacity, { backgroundColor }]}>
      {loading ? (
        <LoadingIndicator small customColor={color} />
      ) : (
        <Picture
          type="NamedSvg"
          name={iconName}
          fill={color}
          width={UI_SIZES.dimensions.width.large}
          height={UI_SIZES.dimensions.height.large}
        />
      )}
    </TouchableOpacity>
  );
};
RoundButton.styles = StyleSheet.create({
  touchableOpacity: {
    width: UI_SIZES.dimensions.width.largePlus,
    height: UI_SIZES.dimensions.height.largePlus,
    borderRadius: UI_SIZES.radius.extraLarge,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
