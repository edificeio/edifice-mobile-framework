import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: UI_SIZES.radius.small,
    borderWidth: 2,
    overflow: 'hidden',
  },
  buttonContainer: {
    paddingHorizontal: UI_SIZES.spacing.tiny,
    backgroundColor: theme.palette.grey.white,
  },
  buttonText: {
    color: theme.ui.text.inverse,
  },
});

interface IButtonGroupProps {
  buttons: string[];
  selectedButton: number;
  containerStyle?: ViewStyle;
  onPress: (index: number) => void;
}

export const ButtonGroup = ({ buttons, selectedButton, onPress, containerStyle }: IButtonGroupProps) => (
  <View style={[styles.mainContainer, containerStyle, { borderColor: theme.palette.primary.regular }]}>
    {buttons.map((button, index) => (
      <TouchableOpacity
        onPress={() => onPress(index)}
        style={[styles.buttonContainer, index === selectedButton && { backgroundColor: theme.palette.primary.regular }]}
        key={index}>
        <SmallBoldText style={[styles.buttonText, index !== selectedButton && { color: theme.palette.primary.regular }]}>
          {button}
        </SmallBoldText>
      </TouchableOpacity>
    ))}
  </View>
);
