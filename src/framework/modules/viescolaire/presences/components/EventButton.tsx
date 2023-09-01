import * as React from 'react';
import { ColorValue, StyleSheet, TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText, BodyText } from '~/framework/components/text';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.minor,
    borderRadius: UI_SIZES.radius.newCard,
  },
  containerDisabled: {
    backgroundColor: theme.palette.grey.pearl,
  },
});

type EventButtonProps = {
  backgroundColor: ColorValue;
  iconName: string;
  text: string;
  disabled?: boolean;
  isSelected?: boolean;
  onPress: () => void;
};

export const EventButton = (props: EventButtonProps) => {
  const TextComponent = props.disabled || props.isSelected ? BodyBoldText : BodyText;
  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      style={[
        styles.container,
        props.isSelected && { backgroundColor: props.backgroundColor },
        props.disabled && styles.containerDisabled,
      ]}>
      <NamedSVG name={props.iconName} width={24} height={24} fill={theme.palette.grey.black} />
      <TextComponent>{props.text}</TextComponent>
    </TouchableOpacity>
  );
};
