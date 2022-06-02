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
    marginBottom: 5,
  },
  buttonContainer: {
    padding: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export const ButtonGroup = (props: {
  buttons: string[];
  selectedButton: number;
  onPress: (index: number) => void;
  containerStyle?: ViewStyle;
}) => {
  return (
    <View style={[style.mainContainer, props.containerStyle, { borderColor: theme.palette.primary.regular }]}>
      {props.buttons.map((button, index) => (
        <TouchableOpacity
          onPress={() => props.onPress(index)}
          style={[style.buttonContainer, index === props.selectedButton && { backgroundColor: theme.palette.primary.regular }]}
          key={index}>
          <TextBold style={[style.buttonText, index !== props.selectedButton && { color: theme.palette.primary.regular }]}>
            {button}
          </TextBold>
        </TouchableOpacity>
      ))}
    </View>
  );
};
