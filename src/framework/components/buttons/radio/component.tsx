import * as React from 'react';
import { Pressable, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';

import styles from './styles';
import type { RadioButtonProps } from './types';

const colors = theme.ui.radio;

// The glyph is drawn in one colour: the accent once chosen, the stroke of an empty ring until then.
const radioIconColor = (isChecked?: boolean, isDisabled?: boolean, isPressed?: boolean) => {
  if (isChecked) return isDisabled ? colors.disabledBackground : colors.background;
  if (isDisabled) return colors.disabledOffBorder;
  return isPressed ? colors.pressedOffBorder : colors.offBorder;
};

export const RadioButton = ({ isChecked, isDisabled, label, onPress, size = 'default', style }: RadioButtonProps) => {
  const [isPressed, setPressed] = React.useState<boolean>(false);
  const LabelTextComponent = size === 'default' ? BodyText : SmallText;
  const iconSize = UI_SIZES.elements.radio[size];

  const onPressIn = () => setPressed(true);

  const onPressOut = () => setPressed(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      style={[styles.container, style]}>
      {label ? (
        <LabelTextComponent style={[styles.labelText, isDisabled && styles.disabledLabelText]}>{label}</LabelTextComponent>
      ) : null}
      <View style={[styles.iconContainer, isPressed && styles.iconPressedContainer]}>
        <Svg
          name={isChecked ? 'ui-radio-checked' : 'ui-radio-unchecked'}
          width={iconSize}
          height={iconSize}
          fill={radioIconColor(isChecked, isDisabled, isPressed)}
        />
      </View>
    </Pressable>
  );
};
