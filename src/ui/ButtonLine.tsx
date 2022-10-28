import styled from '@emotion/native';
import I18n from 'i18n-js';
import * as React from 'react';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
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
  paddingHorizontal: UI_SIZES.spacing.medium,
});

export const ContainerSpacer = styled.View({
  marginTop: UI_SIZES.spacing.small,
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
  paddingHorizontal: UI_SIZES.spacing.medium,
});

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
      <SmallText style={{ flex: 1, color: color || theme.ui.text.regular }}>{I18n.t(title)}</SmallText>
      {/* FIXME: This UI button force to use translation. It shouldn't. */}
      {!hideIcon && <Icon name="arrow_down" color={theme.ui.text.light} style={{ transform: [{ rotate: '270deg' }] }} />}
    </Comp>
  );
};
