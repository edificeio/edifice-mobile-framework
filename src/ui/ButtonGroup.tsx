import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { TextBold } from '~/framework/components/text';

const style = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 5,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 5, // MO-142 use UI_SIZES.spacing here
  },
  buttonContainer: {
    padding: 5, // MO-142 use UI_SIZES.spacing here
  },
  buttonText: {
    color: theme.palette.grey.white,
  },
});

interface IButtonGroupProps {
  buttons: string[];
  selectedButton: number;
  containerStyle?: ViewStyle;
  onPress: (index: number) => void;
}

export const ButtonGroup = ({ buttons, selectedButton, onPress, containerStyle }: IButtonGroupProps) => (
  <View style={[style.mainContainer, containerStyle, { borderColor: theme.palette.primary.regular }]}>
    {buttons.map((button, index) => (
      <TouchableOpacity
        onPress={() => onPress(index)}
        style={[style.buttonContainer, index === selectedButton && { backgroundColor: theme.palette.primary.regular }]}
        key={index}>
        <TextBold style={[style.buttonText, index !== selectedButton && { color: theme.palette.primary.regular }]}>
          {button}
        </TextBold>
      </TouchableOpacity>
    ))}
  </View>
);
