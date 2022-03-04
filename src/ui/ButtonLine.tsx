import style from 'glamorous-native';
import I18n from 'i18n-js';
import * as React from 'react';

import { Icon } from './icons/Icon';

import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const Container = style(TouchableOpacity)({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderColor: '#ddd',
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: 15,
});

export const ContainerSpacer = style.view({
  marginTop: 20,
});

export const ContainerLabel = style.text({
  paddingHorizontal: 15,
  marginTop: 14,
  marginBottom: 6,
  color: CommonStyles.textColor,
});

export const NoTouchableContainer = style.view({
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignSelf: 'stretch',
});

export const ContainerView = style.view({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderColor: '#ddd',
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: 15,
});

export const ContainerTextInput = style.textInput({
  alignItems: 'center',
  flexDirection: 'row',
  backgroundColor: 'white',
  borderBottomWidth: 1,
  borderColor: '#ddd',
  height: 46,
  justifyContent: 'flex-start',
  // marginTop: 20,
  paddingHorizontal: 15,
});

const LinkStyle = style.text(
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
      <LinkStyle color={color}>{I18n.t(title)}</LinkStyle>
      {/* FIXME: This UI button force to use translation. It shouldn't. */}
      {!hideIcon && <Icon name="arrow_down" color="#868CA0" style={{ transform: [{ rotate: '270deg' }] }} />}
    </Comp>
  );
};
