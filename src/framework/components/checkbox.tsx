import * as React from 'react';
import { ColorValue, Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';

export interface CheckboxProps {
  onPress?: () => void;
  onLongPress?: () => void;
  checked: boolean;
  isDisabled?: boolean;
  partialyChecked?: boolean;
  customContainerStyle?: ViewStyle;
  size?: CheckboxSize;
  testID?: string;
}

type CheckboxSize = 'default' | 'small';

const SIZES = UI_SIZES.elements.checkbox;

const HALO_SPACING = UI_SIZES.spacing.tiny;

// The halo follows the box it surrounds rather than rounding for itself: the box's own radius,
// widened by the gap left around it. Never more than half the halo, which iOS clamps and Android
// turns into square corners.
const haloRadius = (size: CheckboxSize) => Math.min(UI_SIZES.radius.small + HALO_SPACING, (SIZES[size].box + 2 * HALO_SPACING) / 2);

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    borderRadius: UI_SIZES.radius.small,
    borderWidth: getScaleWidth(UI_SIZES.border.small),
    justifyContent: 'center',
  },
  defaultBox: {
    height: SIZES.default.box,
    width: SIZES.default.box,
  },
  defaultHalo: {
    borderRadius: haloRadius('default'),
  },
  halo: {
    alignItems: 'center',
    justifyContent: 'center',
    // Android only honours the radius when it has to clip to it.
    overflow: 'hidden',
    padding: HALO_SPACING,
  },
  pressable: {
    alignSelf: 'flex-start',
  },
  smallBox: {
    height: SIZES.small.box,
    width: SIZES.small.box,
  },
  smallHalo: {
    borderRadius: haloRadius('small'),
  },
});

const BOX_STYLE: Record<CheckboxSize, ViewStyle[]> = {
  default: [styles.box, styles.defaultBox],
  small: [styles.box, styles.smallBox],
};

const HALO_STYLE: Record<CheckboxSize, ViewStyle[]> = {
  default: [styles.halo, styles.defaultHalo],
  small: [styles.halo, styles.smallHalo],
};

const colors = theme.ui.checkbox;

const boxColors = (checked: boolean, partialyChecked?: boolean, isDisabled?: boolean, isPressed?: boolean) => {
  if (partialyChecked)
    return {
      background: isDisabled ? colors.disabledIndeterminateBackground : colors.indeterminateBackground,
      border: isDisabled ? colors.disabledIndeterminateBorder : colors.indeterminateBorder,
      content: isDisabled ? colors.disabledIndeterminateContent : colors.indeterminateContent,
    };
  if (checked)
    return {
      background: isDisabled ? colors.disabledBackground : colors.background,
      border: isDisabled ? colors.disabledBackground : colors.border,
      content: isDisabled ? colors.disabledContent : colors.content,
    };
  return {
    background: colors.offBackground,
    border: isDisabled ? colors.disabledOffBorder : isPressed ? colors.pressedOffBorder : colors.offBorder,
    content: isDisabled ? colors.disabledOffContent : colors.offContent,
  };
};

export const Checkbox = ({
  checked,
  customContainerStyle,
  isDisabled,
  onLongPress,
  onPress,
  partialyChecked,
  size = 'default',
  testID,
}: CheckboxProps) => {
  const markSize = SIZES[size].mark;

  const renderMark = (content?: ColorValue) => {
    if (partialyChecked) return <Svg name="ui-checkbox-partial" width={markSize} height={markSize} fill={content} />;
    if (checked) return <Svg name="ui-checkbox-check" width={markSize} height={markSize} fill={content} />;
  };

  const renderBox = ({ pressed }: Readonly<{ pressed: boolean }>) => {
    const box = boxColors(checked, partialyChecked, isDisabled, pressed);

    return (
      <View style={[HALO_STYLE[size], pressed && !isDisabled && { backgroundColor: colors.highlight }]}>
        <View style={[BOX_STYLE[size], { backgroundColor: box.background, borderColor: box.border }]}>
          {renderMark(box.content)}
        </View>
      </View>
    );
  };

  return (
    <Pressable
      disabled={isDisabled}
      onLongPress={onLongPress}
      onPress={onPress}
      // Placing the control is the caller's business, and it is the whole control that moves: a
      // margin given to the box alone would be filled by the halo drawn around it.
      style={[styles.pressable, customContainerStyle]}
      testID={testID}>
      {renderBox}
    </Pressable>
  );
};
