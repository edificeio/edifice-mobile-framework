import * as React from 'react';
import { ColorValue, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';

const styles = StyleSheet.create({
  constainer: {
    width: getScaleWidth(UI_SIZES.dimensions.width.mediumPlus),
    height: getScaleWidth(UI_SIZES.dimensions.height.mediumPlus),
    borderRadius: UI_SIZES.radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Checkbox = ({
  checked,
  onPress,
  customContainerStyle,
  customCheckboxColor,
}: {
  checked: boolean;
  onPress: () => void;
  customContainerStyle?: ViewStyle;
  customCheckboxColor?: ColorValue;
}) => {
  const checkedContainerStyle = {
    backgroundColor: checked ? theme.palette.primary.regular : theme.ui.background.card,
    borderColor: checked ? theme.palette.primary.regular : theme.palette.grey.graphite,
    borderWidth: checked ? undefined : getScaleWidth(UI_SIZES.border.small),
  };

  return (
    <TouchableOpacity onPress={() => onPress && onPress()} style={[styles.constainer, checkedContainerStyle, customContainerStyle]}>
      <NamedSVG
        name="ui-check"
        width={UI_SIZES.elements.icon.xsmall}
        height={UI_SIZES.elements.icon.xsmall}
        fill={customCheckboxColor || theme.ui.text.inverse}
      />
    </TouchableOpacity>
  );
};
