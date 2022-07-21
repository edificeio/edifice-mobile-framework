import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { ColorValue } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

import { Icon } from './icons/Icon';

const Container = styled(TouchableOpacity)({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const ContainerSpacer = styled.View({
  marginTop: UI_SIZES.spacing.small,
});

export const ContainerLabel = styled.Text({
  paddingHorizontal: UI_SIZES.spacing.medium,
  marginTop: UI_SIZES.spacing.medium,
  marginBottom: UI_SIZES.spacing.minor,
  color: theme.ui.text.regular,
});

export const NoTouchableContainer = styled.View({
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignSelf: 'stretch',
});

export const ContainerView = styled.View({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const ContainerTextInput = styled.TextInput({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: theme.ui.background.card,
  borderBottomWidth: 1,
  borderColor: theme.palette.grey.cloudy,
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: UI_SIZES.spacing.medium,
});

const LinkStyle = styled.Text<{ color: ColorValue }>(
  {
    fontSize: 14,
    flex: 1,
  },
  ({ color }) => ({
    color: color || '#414355',
  }),
);

export const ButtonLine = ({
  onPress,
  title,
  color,
  hideIcon,
  disabled = false,
}: {
  onPress: () => any;
  title: string;
  color?: string;
  hideIcon?: boolean;
  disabled?: boolean;
}) => {
  const Comp = disabled ? ContainerView : Container;
  return (
    <Comp {...(!disabled ? { onPress: () => onPress() } : {})}>
      {/* FIXME: a ButtonLine without onClick prop will raise an error. Fire an event up or use onPress={onPress}. */}
      <LinkStyle color={color!}>{I18n.t(title)}</LinkStyle>
      {/* FIXME: This UI button force to use translation. It shouldn't. */}
      {!hideIcon && <Icon name="arrow_down" color={theme.legacy.neutral.regular} style={{ transform: [{ rotate: '270deg' }] }} />}
    </Comp>
  );
};
